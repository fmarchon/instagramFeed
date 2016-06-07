# Instagram Feed

1. Instagram Feed component setup
================================

1.1 Register and Configure an App
---------------------------------

To get started, visit the Instagram API page for developers (https://www.instagram.com/developer/) and click Register Your Application.

In order to register your application a developer account is needed, so you will need to sign up for one (or convert your account to a developer account), this is the account that will manage the client application that will be created.

 - Login to your existing account by selecting the login link.
 
 - Once logged In, you will need to sign up for a developer account.
 
 - Enter your website url (e.g. http://www.jahia.com) and the corresponding phone number and the description of the usage for the application. Once the information is captured and the terms and conditions are accepted, select the “sign up” button.
 
 - Then you can register a new application to receive your Client ID For the “Valid redirect URIs” field enter the following (depending on the final environment setup these URIs may differ):
   `http://localhost:8080/cms/editframe/default/en/sites/<YOUR_SITE_NAME>/home.processInstagramToken.do`
   Replace <YOUR_SITE_NAME> with the name of the configured site name in your environment. You can add as many URIs you want as long as the path specified includes the full URI of the home page item in your content editing environment.
   
 - Leave the Security tab with the default values and select Register to register your client application.
 
 - On the Manage Clients dashboard, you'll see your Client ID and Client Secret, so make note of these since they shall be provided for the Instagram Feed configuration that you'll use in your website.
 
 
1.2 Provide your site the Instagram App Credentials
--------------------------------------------------

Once the module deployed, edit your site and under the option tab, provide the Instagram Application and ID and secret key

1.3 Create and configure a Instagram Feed Jahia component
--------------------------------------------------------

When you insert an Instagram Feed component in Edit mode, the following fields will need to be entered:
 - Text to be displayed as the Title of the component.
 
 - Maximum number of images to display in the component.
 
 - The name of the instagram account (e.g. dxsummit). This account should match the username that authorizes the application the first time an access token is requested (more details below).

The first time the Instagram Feed component is created the following will be displayed:
* `No token assigned`
* `Refresh the access token`

This indicates the component was created but it has no access token associated, which is required to retrieve the instagram image feeds.

In order to get the access token, click the “Refresh the access token” link to ask instagram for a token to be used by the component.

Once you click the link, a new window will be opened redirecting you to a page where you will need to authorize the client aplication access to your account information. Make sure you login with the account that contains the media you want to display as part of the feed component.

Once you login to instagram and authorize the application, you will be taken to a page confirming the new token was received successfully.

Close the browser window/tab and refresh the page containing the Instagram Feed Component, it should now display the images from instagram. Note: the configured Instagram page name and the account used to authorize the application must match, otherwise the component will not have access rights to display the instagram page images.
