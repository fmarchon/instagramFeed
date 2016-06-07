package org.jahia.modules.instagramfeed;

/**
 * Created by ramiroc on 5/19/2016.
 * POJO used to represent the instagram image instance
 */
public class InstagramPhoto {
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    private String url;

    public String getWidth() {
        return width;
    }

    public void setWidth(String width) {
        this.width = width;
    }

    public String getHeight() {
        return height;
    }

    public void setHeight(String height) {
        this.height = height;
    }

    private String width;
    private String height;
}
