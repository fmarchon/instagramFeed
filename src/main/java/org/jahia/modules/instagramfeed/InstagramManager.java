package org.jahia.modules.instagramfeed;

import org.jinstagram.Instagram;
import org.jinstagram.auth.InstagramAuthService;
import org.jinstagram.auth.model.Token;
import org.jinstagram.auth.model.Verifier;
import org.jinstagram.auth.oauth.InstagramService;
import org.jinstagram.entity.common.ImageData;
import org.jinstagram.entity.common.Images;
import org.jinstagram.entity.users.feed.MediaFeed;
import org.jinstagram.entity.users.feed.MediaFeedData;
import org.jinstagram.entity.users.feed.UserFeed;
import org.jinstagram.entity.users.feed.UserFeedData;
import org.jinstagram.exceptions.InstagramException;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by ramiroc on 5/19/2016.
 * This is the class used to interface with the instagram API
 */
public class InstagramManager {

    private String clientId;
    private String clientSecret;
    private String callbackUrl;
    private String instagramCode;
    private String pageName;
    private String accessToken;


    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getPageName() {
        return pageName;
    }

    public void setPageName(String pageName) {
        this.pageName = pageName;
    }

    public String getAccessToken()
    {
        if (accessToken == null || accessToken.isEmpty()) {
            if (service == null)
                initialize();
            accessToken = service.getAccessToken(new Verifier(instagramCode)).getToken();
        }
        return accessToken;
    }

    public String getInstagramCode() {
        return instagramCode;
    }

    public void setInstagramCode(String instagramCode) {
        this.instagramCode = instagramCode;
    }

    private static final Token EMPTY_TOKEN = null;
    private InstagramService service;

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getCallbackUrl() {
        return callbackUrl;
    }

    public void setCallbackUrl(String callbackUrl) {
        this.callbackUrl = callbackUrl;
    }

    public String getAuthorizationUrl()
    {
        if(service == null)
            initialize();

        return service.getAuthorizationUrl();
    }

    public List<InstagramPhoto> getPhotos()
    {
        ArrayList<InstagramPhoto> photos = new ArrayList<InstagramPhoto>();
        if(service == null)
            initialize();

        if(accessToken!=null && !accessToken.isEmpty()){
            Instagram instagram = new Instagram(accessToken,clientSecret);
            UserFeed userFeed = null;
            try {
                userFeed = instagram.searchUser(pageName);
                List<UserFeedData> userList = userFeed.getUserList();
                System.out.println("userList count : " + userList.size());
                String userId = null;
                for (UserFeedData user : userList) {
                    System.out.println("user Name : " + user.getUserName());
                    if(user.getUserName().equalsIgnoreCase(pageName))
                        userId = user.getId();
                }

                if (userId != null)
                {
                    System.out.println("user id : " + userId);
                    MediaFeed recentMediaFeed = instagram.getRecentMediaFeed(userId);
                    List<MediaFeedData> mediaFeeds = recentMediaFeed.getData();

                    System.out.println("media feed count : " + mediaFeeds.size());
                    InstagramPhoto photo;
                    for (MediaFeedData mediaData : mediaFeeds) {
                        Images images = mediaData.getImages();
                        ImageData thumbnailImg = images.getLowResolution();
                        photo = new InstagramPhoto();
                        photo.setUrl(thumbnailImg.getImageUrl());
                        photo.setHeight(Integer.toString(thumbnailImg.getImageHeight()));
                        photo.setWidth(Integer.toString(thumbnailImg.getImageWidth()));
                        photos.add(photo);
                        System.out.println("media url : " + photo.getUrl());
                    }
                }
            } catch (InstagramException e) {
                e.printStackTrace();
            }

        }
        return photos;
    }

    public void initialize(){
        service = new InstagramAuthService()
                .apiKey(clientId)
                .apiSecret(clientSecret)
                .callback(callbackUrl)
                .scope("public_content")
                .build();
    }
}
