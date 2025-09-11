import { supabase } from './supabaseClient';

export interface CreateShortLinkData {
  originalUrl: string;
  title?: string;
  customCode?: string;
  expiresAt?: Date;
}

export interface ShortLink {
  id: string;
  short_code: string;
  original_url: string;
  title?: string;
  user_id: string;
  clicks: number;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

class LinkShorteningService {
  private readonly BASE_URL = window.location.origin;
  private readonly RESERVED_CODES = [
    'dashboard', 'premiumdashboard', 'admin', 'login', 'signup', 'getstarted',
    'profile', 'settings', 'api', 'publicprofile', 'privateprofile', 'homepage',
    'about', 'contact', 'terms', 'privacy', 'faq', 'features', 'pricing',
    'logout', 'user', 'users', 'static', 'assets', 'vercel', 'next', 'app',
    'src', 'components', 'lib', 'clinkr', 'shortener', 'analytics', 'reports',
    'www', 'mail', 'ftp', 'http', 'https', 'support', 'help', 'docs', 'blog',
    'news', 'press', 'jobs', 'careers', 'investor', 'legal', 'security'
  ];

  async createShortLink(data: CreateShortLinkData, userId: string): Promise<ShortLink> {
    const { originalUrl, title, customCode, expiresAt } = data;

    // Validate URL
    if (!this.isValidUrl(originalUrl)) {
      throw new Error('Invalid URL provided');
    }

    // Generate or validate short code
    const shortCode = customCode || await this.generateShortCode();
    
    // Validate custom code if provided
    if (customCode) {
      const validationError = this.validateCustomCode(customCode);
      if (validationError) {
        throw new Error(validationError);
      }
    }
    
    if (this.RESERVED_CODES.includes(shortCode.toLowerCase())) {
      throw new Error('This short code is reserved. Please choose another one.');
    }

    // Check if short code already exists
    const { data: existingLink } = await supabase
      .from('shortened_links')
      .select('short_code')
      .eq('short_code', shortCode)
      .single();

    if (existingLink) {
      throw new Error('This slug is already in use. Please choose another one.');
    }

    // Get user's profile to ensure it exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Create short link
    const { data: shortLink, error } = await supabase
      .from('shortened_links')
      .insert({
        short_code: shortCode,
        original_url: originalUrl,
        title: title || this.extractTitleFromUrl(originalUrl),
        user_id: userId, // Only need user_id, no profile_id needed
        expires_at: expiresAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create short link: ${error.message}`);
    }

    return shortLink;
  }

  async getUserShortLinks(userId: string): Promise<ShortLink[]> {
    const { data, error } = await supabase
      .from('shortened_links')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch short links: ${error.message}`);
    }

    return data || [];
  }

  async deleteShortLink(shortCode: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('shortened_links')
      .update({ is_active: false })
      .eq('short_code', shortCode)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to delete short link: ${error.message}`);
    }
  }

  async updateShortLink(shortCode: string, userId: string, updates: Partial<CreateShortLinkData>): Promise<void> {
    const updateData: any = {};
    
    if (updates.originalUrl) {
      if (!this.isValidUrl(updates.originalUrl)) {
        throw new Error('Invalid URL provided');
      }
      updateData.original_url = updates.originalUrl;
    }
    
    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    
    if (updates.expiresAt !== undefined) {
      updateData.expires_at = updates.expiresAt?.toISOString();
    }

    const { error } = await supabase
      .from('shortened_links')
      .update(updateData)
      .eq('short_code', shortCode)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to update short link: ${error.message}`);
    }
  }

  async getShortLinkAnalytics(shortCode: string, userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('short_code', shortCode)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    return data || [];
  }

  private async generateShortCode(): Promise<string> {
    // Try different patterns for better readability
    const patterns = [
      () => this.generateRandomCode(6), // 6 chars
      () => this.generateRandomCode(8), // 8 chars
      () => this.generateWordLikeCode(), // word-like
    ];

    for (const pattern of patterns) {
      const code = pattern();
      
      // Check if generated code already exists
      const { data: existingLink } = await supabase
        .from('shortened_links')
        .select('short_code')
        .eq('short_code', code)
        .single();

      if (!existingLink) {
        return code;
      }
    }

    // If all patterns fail, fallback to timestamp-based
    return this.generateTimestampCode();
  }

  private generateRandomCode(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  private generateWordLikeCode(): string {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    let result = '';
    
    // Generate a word-like pattern: consonant-vowel-consonant-vowel-consonant-vowel
    for (let i = 0; i < 6; i++) {
      if (i % 2 === 0) {
        result += consonants.charAt(Math.floor(Math.random() * consonants.length));
      } else {
        result += vowels.charAt(Math.floor(Math.random() * vowels.length));
      }
    }

    return result;
  }

  private generateTimestampCode(): string {
    // Use timestamp + random suffix for uniqueness
    const timestamp = Date.now().toString(36);
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return timestamp + randomSuffix;
  }

  private validateCustomCode(code: string): string | null {
    // Check length
    if (code.length < 3) {
      return 'Custom slug must be at least 3 characters long';
    }
    
    if (code.length > 50) {
      return 'Custom slug must be less than 50 characters';
    }

    // Check for valid characters (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      return 'Custom slug can only contain letters, numbers, and hyphens';
    }

    // Check for consecutive hyphens
    if (code.includes('--')) {
      return 'Custom slug cannot contain consecutive hyphens';
    }

    // Check for starting/ending with hyphen
    if (code.startsWith('-') || code.endsWith('-')) {
      return 'Custom slug cannot start or end with a hyphen';
    }

    // Check for reserved words
    if (this.RESERVED_CODES.includes(code.toLowerCase())) {
      return 'This slug is reserved. Please choose another one';
    }

    return null;
  }

  // New method to check slug availability
  async checkSlugAvailability(slug: string): Promise<{ available: boolean; error?: string }> {
    const validationError = this.validateCustomCode(slug);
    if (validationError) {
      return { available: false, error: validationError };
    }

    const { data: existingLink } = await supabase
      .from('shortened_links')
      .select('short_code')
      .eq('short_code', slug)
      .single();

    if (existingLink) {
      return { available: false, error: 'This slug is already in use' };
    }

    return { available: true };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Short Link';
    }
  }

  getShortLinkUrl(shortCode: string): string {
    return `${this.BASE_URL}/${shortCode}`;
  }

  // Generate QR code URL (using a free QR code service)
  getQRCodeUrl(shortCode: string): string {
    const shortUrl = this.getShortLinkUrl(shortCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shortUrl)}`;
  }
}

export const linkShorteningService = new LinkShorteningService();
