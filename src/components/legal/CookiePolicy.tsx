import Navbar from '../homepage/Navbar';
import Footer from '../homepage/Footer';

const CookiePolicy = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto p-8 pt-24">
        <h1 className="text-3xl font-bold mb-6 text-white">Cookie Policy for Clinkr</h1>

        <p className="mb-4">
          This Cookie Policy explains how Clinkr ("Company," "we," "us," and "our") uses cookies and similar technologies to recognize you when you visit our websites at clinkr.live ("Websites"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </p>

        <p className="mb-4">
          In some cases we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">What are cookies?</h2>

        <p className="mb-4">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>

        <p className="mb-4">
          Cookies set by the website owner (in this case, Clinkr) are called "first-party cookies." Cookies set by parties other than the website owner are called "third-party cookies." Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">Why do we use cookies?</h2>

        <p className="mb-4">
          We use first- and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Websites to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on the Online Properties. Third parties serve cookies through our Websites for advertising, analytics, and other purposes. This is described in more detail below.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">How can I control cookies?</h2>

        <p className="mb-4">
          You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
        </p>

        <p className="mb-4">
          The Cookie Consent Manager can be found in the notification banner and on our website. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
        </p>

        <p className="mb-4">
          The specific types of first- and third-party cookies served through our Websites and the purposes they perform are described in the table below (please note that the specific cookies served may vary depending on the specific Online Properties you visit):
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">What about other tracking technologies, like web beacons?</h2>

        <p className="mb-4">
          Cookies are not the only way to recognize or track visitors to a website. We may use other, similar technologies from time to time, like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enable us to recognize when someone has visited our Websites or opened an e-mail including them. This allows us, for example, to monitor the traffic patterns of users from one page within our Websites to another, to deliver or communicate with cookies, to understand whether you have come to our Websites from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of e-mail marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">Do you use Flash cookies or Local Shared Objects?</h2>

        <p className="mb-4">
          Websites may also use "Flash Cookies" (also known as Local Shared Objects or "LSOs") to, among other things, collect and store information about your use of our services, fraud prevention, and for other site operations.
        </p>

        <p className="mb-4">
          If you do not want Flash Cookies stored on your computer, you can adjust the settings of your Flash player to block Flash Cookies storage using the tools contained in the Website Storage Settings Panel. You can also control Flash Cookies by going to the Global Storage Settings Panel and following the instructions (which may include instructions that explain, for example, how to delete existing Flash Cookies (referred to as "information" on the Macromedia site), how to prevent Flash LSOs from being placed on your computer without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies that are not being delivered by the operator of the page you are on at the time).
        </p>

        <p className="mb-4">
          Please note that setting the Flash Player to restrict or limit acceptance of Flash Cookies may reduce or impede the functionality of some Flash applications, including, potentially, Flash applications used in connection with our services or online content.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">Do you serve targeted advertising?</h2>

        <p className="mb-4">
          Third parties may serve cookies on your computer or mobile device to serve advertising through our Websites. These companies may use information about your visits to this and other websites in order to provide relevant advertisements about goods and services that you may find of interest. They may also employ technology that is used to measure the effectiveness of advertisements. This can be accomplished by them using cookies or web beacons to collect information about your visits to this and other sites in order to provide relevant advertisements about goods and services of potential interest to you. The information collected through this process does not enable us or them to identify your name, contact details or other personally identifying details unless you choose to provide these.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">How often will you update this Cookie Policy?</h2>

        <p className="mb-4">
          We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </p>

        <p className="mb-4">
          The date at the top of this Cookie Policy indicates when it was last updated.
        </p>

        <h2 className="text-2xl font-semibold mb-4 text-white">Where can I get further information?</h2>

        <p className="mb-4">
          If you have any questions about our use of cookies or other technologies, please email us at support@clinkr.live or by post to:
        </p>

        <p className="mb-4">
          Clinkr
          <br />
          [Your Company Address Here]
          <br />
          [Your City, Postal Code]
          <br />
          [Your Country]
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
