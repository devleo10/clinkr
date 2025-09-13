/**
 * Comprehensive Country Utilities
 * Provides robust country code to name mapping and validation
 */

// Comprehensive ISO 3166-1 alpha-2 country codes mapping
const COUNTRY_CODES: Record<string, string> = {
  'AD': 'Andorra',
  'AE': 'United Arab Emirates',
  'AF': 'Afghanistan',
  'AG': 'Antigua and Barbuda',
  'AI': 'Anguilla',
  'AL': 'Albania',
  'AM': 'Armenia',
  'AO': 'Angola',
  'AQ': 'Antarctica',
  'AR': 'Argentina',
  'AS': 'American Samoa',
  'AT': 'Austria',
  'AU': 'Australia',
  'AW': 'Aruba',
  'AX': 'Åland Islands',
  'AZ': 'Azerbaijan',
  'BA': 'Bosnia and Herzegovina',
  'BB': 'Barbados',
  'BD': 'Bangladesh',
  'BE': 'Belgium',
  'BF': 'Burkina Faso',
  'BG': 'Bulgaria',
  'BH': 'Bahrain',
  'BI': 'Burundi',
  'BJ': 'Benin',
  'BL': 'Saint Barthélemy',
  'BM': 'Bermuda',
  'BN': 'Brunei',
  'BO': 'Bolivia',
  'BQ': 'Caribbean Netherlands',
  'BR': 'Brazil',
  'BS': 'Bahamas',
  'BT': 'Bhutan',
  'BV': 'Bouvet Island',
  'BW': 'Botswana',
  'BY': 'Belarus',
  'BZ': 'Belize',
  'CA': 'Canada',
  'CC': 'Cocos Islands',
  'CD': 'Democratic Republic of the Congo',
  'CF': 'Central African Republic',
  'CG': 'Republic of the Congo',
  'CH': 'Switzerland',
  'CI': 'Côte d\'Ivoire',
  'CK': 'Cook Islands',
  'CL': 'Chile',
  'CM': 'Cameroon',
  'CN': 'China',
  'CO': 'Colombia',
  'CR': 'Costa Rica',
  'CU': 'Cuba',
  'CV': 'Cape Verde',
  'CW': 'Curaçao',
  'CX': 'Christmas Island',
  'CY': 'Cyprus',
  'CZ': 'Czech Republic',
  'DE': 'Germany',
  'DJ': 'Djibouti',
  'DK': 'Denmark',
  'DM': 'Dominica',
  'DO': 'Dominican Republic',
  'DZ': 'Algeria',
  'EC': 'Ecuador',
  'EE': 'Estonia',
  'EG': 'Egypt',
  'EH': 'Western Sahara',
  'ER': 'Eritrea',
  'ES': 'Spain',
  'ET': 'Ethiopia',
  'FI': 'Finland',
  'FJ': 'Fiji',
  'FK': 'Falkland Islands',
  'FM': 'Micronesia',
  'FO': 'Faroe Islands',
  'FR': 'France',
  'GA': 'Gabon',
  'GB': 'United Kingdom',
  'GD': 'Grenada',
  'GE': 'Georgia',
  'GF': 'French Guiana',
  'GG': 'Guernsey',
  'GH': 'Ghana',
  'GI': 'Gibraltar',
  'GL': 'Greenland',
  'GM': 'Gambia',
  'GN': 'Guinea',
  'GP': 'Guadeloupe',
  'GQ': 'Equatorial Guinea',
  'GR': 'Greece',
  'GS': 'South Georgia and the South Sandwich Islands',
  'GT': 'Guatemala',
  'GU': 'Guam',
  'GW': 'Guinea-Bissau',
  'GY': 'Guyana',
  'HK': 'Hong Kong',
  'HM': 'Heard Island and McDonald Islands',
  'HN': 'Honduras',
  'HR': 'Croatia',
  'HT': 'Haiti',
  'HU': 'Hungary',
  'ID': 'Indonesia',
  'IE': 'Ireland',
  'IL': 'Israel',
  'IM': 'Isle of Man',
  'IN': 'India',
  'IO': 'British Indian Ocean Territory',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'IS': 'Iceland',
  'IT': 'Italy',
  'JE': 'Jersey',
  'JM': 'Jamaica',
  'JO': 'Jordan',
  'JP': 'Japan',
  'KE': 'Kenya',
  'KG': 'Kyrgyzstan',
  'KH': 'Cambodia',
  'KI': 'Kiribati',
  'KM': 'Comoros',
  'KN': 'Saint Kitts and Nevis',
  'KP': 'North Korea',
  'KR': 'South Korea',
  'KW': 'Kuwait',
  'KY': 'Cayman Islands',
  'KZ': 'Kazakhstan',
  'LA': 'Laos',
  'LB': 'Lebanon',
  'LC': 'Saint Lucia',
  'LI': 'Liechtenstein',
  'LK': 'Sri Lanka',
  'LR': 'Liberia',
  'LS': 'Lesotho',
  'LT': 'Lithuania',
  'LU': 'Luxembourg',
  'LV': 'Latvia',
  'LY': 'Libya',
  'MA': 'Morocco',
  'MC': 'Monaco',
  'MD': 'Moldova',
  'ME': 'Montenegro',
  'MF': 'Saint Martin',
  'MG': 'Madagascar',
  'MH': 'Marshall Islands',
  'MK': 'North Macedonia',
  'ML': 'Mali',
  'MM': 'Myanmar',
  'MN': 'Mongolia',
  'MO': 'Macao',
  'MP': 'Northern Mariana Islands',
  'MQ': 'Martinique',
  'MR': 'Mauritania',
  'MS': 'Montserrat',
  'MT': 'Malta',
  'MU': 'Mauritius',
  'MV': 'Maldives',
  'MW': 'Malawi',
  'MX': 'Mexico',
  'MY': 'Malaysia',
  'MZ': 'Mozambique',
  'NA': 'Namibia',
  'NC': 'New Caledonia',
  'NE': 'Niger',
  'NF': 'Norfolk Island',
  'NG': 'Nigeria',
  'NI': 'Nicaragua',
  'NL': 'Netherlands',
  'NO': 'Norway',
  'NP': 'Nepal',
  'NR': 'Nauru',
  'NU': 'Niue',
  'NZ': 'New Zealand',
  'OM': 'Oman',
  'PA': 'Panama',
  'PE': 'Peru',
  'PF': 'French Polynesia',
  'PG': 'Papua New Guinea',
  'PH': 'Philippines',
  'PK': 'Pakistan',
  'PL': 'Poland',
  'PM': 'Saint Pierre and Miquelon',
  'PN': 'Pitcairn Islands',
  'PR': 'Puerto Rico',
  'PS': 'Palestine',
  'PT': 'Portugal',
  'PW': 'Palau',
  'PY': 'Paraguay',
  'QA': 'Qatar',
  'RE': 'Réunion',
  'RO': 'Romania',
  'RS': 'Serbia',
  'RU': 'Russia',
  'RW': 'Rwanda',
  'SA': 'Saudi Arabia',
  'SB': 'Solomon Islands',
  'SC': 'Seychelles',
  'SD': 'Sudan',
  'SE': 'Sweden',
  'SG': 'Singapore',
  'SH': 'Saint Helena',
  'SI': 'Slovenia',
  'SJ': 'Svalbard and Jan Mayen',
  'SK': 'Slovakia',
  'SL': 'Sierra Leone',
  'SM': 'San Marino',
  'SN': 'Senegal',
  'SO': 'Somalia',
  'SR': 'Suriname',
  'SS': 'South Sudan',
  'ST': 'São Tomé and Príncipe',
  'SV': 'El Salvador',
  'SX': 'Sint Maarten',
  'SY': 'Syria',
  'SZ': 'Eswatini',
  'TC': 'Turks and Caicos Islands',
  'TD': 'Chad',
  'TF': 'French Southern Territories',
  'TG': 'Togo',
  'TH': 'Thailand',
  'TJ': 'Tajikistan',
  'TK': 'Tokelau',
  'TL': 'East Timor',
  'TM': 'Turkmenistan',
  'TN': 'Tunisia',
  'TO': 'Tonga',
  'TR': 'Turkey',
  'TT': 'Trinidad and Tobago',
  'TV': 'Tuvalu',
  'TW': 'Taiwan',
  'TZ': 'Tanzania',
  'UA': 'Ukraine',
  'UG': 'Uganda',
  'UM': 'United States Minor Outlying Islands',
  'US': 'United States',
  'UY': 'Uruguay',
  'UZ': 'Uzbekistan',
  'VA': 'Vatican City',
  'VC': 'Saint Vincent and the Grenadines',
  'VE': 'Venezuela',
  'VG': 'British Virgin Islands',
  'VI': 'U.S. Virgin Islands',
  'VN': 'Vietnam',
  'VU': 'Vanuatu',
  'WF': 'Wallis and Futuna',
  'WS': 'Samoa',
  'YE': 'Yemen',
  'YT': 'Mayotte',
  'ZA': 'South Africa',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
  // Special cases and common variations
  'XX': 'Unknown',
  'ZZ': 'Unknown',
  'T1': 'Tor Network',
  'A1': 'Anonymous Proxy',
  'A2': 'Satellite Provider',
  'O1': 'Other'
};

// Alternative country names mapping for common variations
const COUNTRY_ALTERNATIVES: Record<string, string> = {
  'United States of America': 'US',
  'USA': 'US',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Great Britain': 'GB',
  'Britain': 'GB',
  'South Korea': 'KR',
  'North Korea': 'KP',
  'Republic of Korea': 'KR',
  'Democratic People\'s Republic of Korea': 'KP',
  'Russia': 'RU',
  'Russian Federation': 'RU',
  'China': 'CN',
  'People\'s Republic of China': 'CN',
  'Taiwan': 'TW',
  'Republic of China': 'TW',
  'Hong Kong': 'HK',
  'Macau': 'MO',
  'Macao': 'MO',
  'Czech Republic': 'CZ',
  'Czechia': 'CZ',
  'Slovakia': 'SK',
  'Slovak Republic': 'SK',
  'Macedonia': 'MK',
  'North Macedonia': 'MK',
  'Moldova': 'MD',
  'Republic of Moldova': 'MD',
  'Bosnia': 'BA',
  'Bosnia and Herzegovina': 'BA',
  'Serbia': 'RS',
  'Republic of Serbia': 'RS',
  'Montenegro': 'ME',
  'Croatia': 'HR',
  'Republic of Croatia': 'HR',
  'Slovenia': 'SI',
  'Republic of Slovenia': 'SI',
  'Eswatini': 'SZ',
  'Swaziland': 'SZ',
  'East Timor': 'TL',
  'Timor-Leste': 'TL',
  'Democratic Republic of the Congo': 'CD',
  'DRC': 'CD',
  'Congo': 'CG',
  'Republic of the Congo': 'CG',
  'Ivory Coast': 'CI',
  'Côte d\'Ivoire': 'CI',
  'Cape Verde': 'CV',
  'São Tomé and Príncipe': 'ST',
  'São Tomé and Principe': 'ST',
  'Saint Vincent and the Grenadines': 'VC',
  'St. Vincent and the Grenadines': 'VC',
  'Saint Kitts and Nevis': 'KN',
  'St. Kitts and Nevis': 'KN',
  'Saint Lucia': 'LC',
  'St. Lucia': 'LC',
  'Antigua and Barbuda': 'AG',
  'Trinidad and Tobago': 'TT',
  'Dominican Republic': 'DO',
  'Dominica': 'DM',
  'Grenada': 'GD',
  'Barbados': 'BB',
  'Jamaica': 'JM',
  'Bahamas': 'BS',
  'Belize': 'BZ',
  'Costa Rica': 'CR',
  'El Salvador': 'SV',
  'Guatemala': 'GT',
  'Honduras': 'HN',
  'Nicaragua': 'NI',
  'Panama': 'PA',
  'Cuba': 'CU',
  'Haiti': 'HT',
  'Puerto Rico': 'PR',
  'Virgin Islands': 'VI',
  'British Virgin Islands': 'VG',
  'U.S. Virgin Islands': 'VI',
  'Cayman Islands': 'KY',
  'Turks and Caicos Islands': 'TC',
  'Bermuda': 'BM',
  'Greenland': 'GL',
  'Faroe Islands': 'FO',
  'Åland Islands': 'AX',
  'Svalbard and Jan Mayen': 'SJ',
  'Bouvet Island': 'BV',
  'Heard Island and McDonald Islands': 'HM',
  'South Georgia and the South Sandwich Islands': 'GS',
  'Falkland Islands': 'FK',
  'French Southern Territories': 'TF',
  'Antarctica': 'AQ',
  'Christmas Island': 'CX',
  'Cocos Islands': 'CC',
  'Norfolk Island': 'NF',
  'Lord Howe Island': 'NF',
  'Macquarie Island': 'NF',
  'Ashmore and Cartier Islands': 'AU',
  'Coral Sea Islands': 'AU',
  'Australian Antarctic Territory': 'AU'
};

/**
 * Get country name from ISO 3166-1 alpha-2 country code
 * @param code - ISO country code (e.g., 'US', 'GB', 'FR')
 * @returns Full country name or the code if not found
 */
export const getCountryName = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return 'Unknown';
  }

  const upperCode = code.toUpperCase().trim();
  
  // Check direct mapping first
  if (COUNTRY_CODES[upperCode]) {
    return COUNTRY_CODES[upperCode];
  }

  // Check if it's already a country name
  if (COUNTRY_ALTERNATIVES[upperCode]) {
    const mappedCode = COUNTRY_ALTERNATIVES[upperCode];
    return COUNTRY_CODES[mappedCode] || upperCode;
  }

  // Check alternative names
  const alternativeCode = COUNTRY_ALTERNATIVES[upperCode];
  if (alternativeCode && COUNTRY_CODES[alternativeCode]) {
    return COUNTRY_CODES[alternativeCode];
  }

  // Return the original code if not found
  return upperCode;
};

/**
 * Check if a country code is valid
 * @param code - ISO country code to validate
 * @returns boolean indicating if the code is valid
 */
export const isValidCountryCode = (code: string): boolean => {
  if (!code || typeof code !== 'string') {
    return false;
  }

  const upperCode = code.toUpperCase().trim();
  return upperCode in COUNTRY_CODES || upperCode in COUNTRY_ALTERNATIVES;
};

/**
 * Get all available country codes
 * @returns Array of all country codes
 */
export const getAllCountryCodes = (): string[] => {
  return Object.keys(COUNTRY_CODES);
};

/**
 * Get all country names
 * @returns Array of all country names
 */
export const getAllCountryNames = (): string[] => {
  return Object.values(COUNTRY_CODES);
};

/**
 * Search for countries by name (case-insensitive partial match)
 * @param query - Search query
 * @returns Array of matching country codes and names
 */
export const searchCountries = (query: string): Array<{ code: string; name: string }> => {
  if (!query || typeof query !== 'string') {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const results: Array<{ code: string; name: string }> = [];

  // Search in country names
  Object.entries(COUNTRY_CODES).forEach(([code, name]) => {
    if (name.toLowerCase().includes(lowerQuery)) {
      results.push({ code, name });
    }
  });

  // Search in alternative names
  Object.entries(COUNTRY_ALTERNATIVES).forEach(([altName, code]) => {
    if (altName.toLowerCase().includes(lowerQuery) && COUNTRY_CODES[code]) {
      results.push({ code, name: COUNTRY_CODES[code] });
    }
  });

  return results;
};

/**
 * Get country flag emoji (if available)
 * @param code - ISO country code
 * @returns Flag emoji or empty string
 */
export const getCountryFlag = (code: string): string => {
  if (!code || typeof code !== 'string') {
    return '';
  }

  const upperCode = code.toUpperCase().trim();
  
  // Convert country code to flag emoji
  if (upperCode.length === 2) {
    const codePoints = upperCode
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  return '';
};

/**
 * Enhanced country data with validation and formatting
 * @param countryData - Raw country data from analytics
 * @returns Formatted country data with validation
 */
export const formatCountryData = (countryData: { country: string; visits: number }): {
  country: string;
  countryName: string;
  visits: number;
  isValid: boolean;
  flag: string;
} => {
  const countryCode = countryData.country || 'Unknown';
  const countryName = getCountryName(countryCode);
  const isValid = isValidCountryCode(countryCode);
  const flag = getCountryFlag(countryCode);

  return {
    country: countryCode,
    countryName,
    visits: countryData.visits || 0,
    isValid,
    flag
  };
};

/**
 * Filter and sort countries with proper validation
 * @param countries - Array of country data
 * @returns Filtered and sorted countries with valid data first
 */
export const filterAndSortCountries = (
  countries: Array<{ country: string; visits: number }>
): Array<{ country: string; countryName: string; visits: number; isValid: boolean; flag: string }> => {
  if (!Array.isArray(countries)) {
    return [];
  }

  return countries
    .map(formatCountryData)
    .sort((a, b) => {
      // Sort by validity first (valid countries first), then by visits
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;
      return b.visits - a.visits;
    });
};

export default {
  getCountryName,
  isValidCountryCode,
  getAllCountryCodes,
  getAllCountryNames,
  searchCountries,
  getCountryFlag,
  formatCountryData,
  filterAndSortCountries
};
