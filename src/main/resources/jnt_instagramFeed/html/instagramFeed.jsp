<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="ui" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="s" uri="http://www.jahia.org/tags/search" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<template:addResources type="css" resources="photoswipe/photoswipe.css" />
<template:addResources type="css" resources="photoswipe/default-skin/default-skin.css" />
<template:addResources type="javascript" resources="photoswipe/photoswipe.min.js"/>
<template:addResources type="javascript" resources="photoswipe/photoswipe-ui-default.min.js"/>
<template:addResources type="css" resources="bootstrap.min.css" />
<template:addResources type="css" resources="instagramFeed.css" />
<template:addResources type="javascript" resources="instagramFeed.js"/>

<c:set var="title" value="${currentNode.properties['jcr:title'].string}"/>
<c:set var="siteNode" value="${renderContext.mainResource.node.resolveSite}"/>
<c:set var="uuid" value="${currentNode.identifier}"/>
<div class="margin-top-20 margin-bottom-20">
    <c:choose>
        <c:when test="${jcr:isNodeType(siteNode, 'jmix:instagramFeedConfiguration') and
        siteNode.properties['instagramApplicationId'] != null and
        siteNode.properties['instagramApplicationSecret'] != null}">
            <jsp:useBean id="instagramManager" class="org.jahia.modules.instagramfeed.InstagramManager">
                <jsp:setProperty name="instagramManager"
                                  property="clientSecret"
                                  value="${siteNode.properties['instagramApplicationSecret'].string}"/>
                <jsp:setProperty name="instagramManager"
                                  property="clientId"
                                  value="${siteNode.properties['instagramApplicationId'].string}"/>

                <jsp:setProperty name="instagramManager"
                                  property="pageName"
                                  value="${ currentNode.properties['pageName'].string}"/>
            </jsp:useBean>
            <c:set var="token" value="${currentNode.properties['accessToken'].string}"/>
            <c:url var="callbackUrl" value="${url.server}${url.base}${renderContext.site.home.path}.processInstagramToken.do?rid=${renderContext.mainResource.node.identifier}&nid=${currentNode.identifier}"/>
            <jsp:setProperty name="instagramManager"
                              property="callbackUrl"
                              value="${callbackUrl}"/>


            <div class="no-padding feed-component instagram-feed instagram">
                <c:if test="${not empty title}">
                    <div class="headline">
                        <h2>${title}</h2>
                    </div>
                </c:if>
                <div id="instagram-gallery${uuid}" class="photoswipe-gallery${uuid}"></div>
                <div class="clearfix"></div>
                <div class="component-footer">
                    <a href="https://www.instagram.com/${instagramManager.pageName}" class="footerlink" target="_blank"><fmt:message key="label_InstagramPageLinkLabel" /></a>
                </div>
            </div>

            <c:if test="${renderContext.editMode}">
                <p>
                    <c:choose>
                        <c:when test="${empty token}">
                            <span><fmt:message key="label_InstagramTokenNotAssignedLabel" /></span>
                        </c:when>
                        <c:otherwise>
                            <span><fmt:message key="label_InstagramTokenLabel" /></span>
                        </c:otherwise>
                    </c:choose>
                </p>
                <p>
                    <a href="${instagramManager.authorizationUrl}" class="footerlink btn btn-default" target="_blank"><fmt:message key="label_InstagramRefreshTokenLabel" /></a>
                </p>
            </c:if>

            <template:addResources>
                <script type="text/javascript">
                    initializeInstagramPhotos = function () {
                        var _config = {
                            /* shared class used to activate all photoswipe enabled galleries */
                            photoswipeSelector: '.photoswipe-gallery${uuid}',
                            renderGallery: true,
                            /* configuration for each gallery */
                            galleries: [
                                {
                                    /* where each gallery will be injected*/
                                    domEntrypoint: '#instagram-gallery${uuid}',
                                    /* default height and width to be used if one isn't provided per image configuration, REQUIRED */
                                    defaultHeight: '315',
                                    defaultWidth: '446',
                                    /* configuration per gallery */
                                    images: []
                                }
                            ]
                        };
                        <c:if test="${not empty token}">
                            <jsp:setProperty name="instagramManager"
                                              property="accessToken"
                                              value="${token}"/>
                            <c:set var="photos" value="${instagramManager.photos}"/>
                            <c:forEach items="${photos}" var="photo" end="${currentNode.properties['maxEntries'].long - 1}">
                            _config.galleries[0].images.push({url: '${photo.url}',height: '${photo.height}',width: '${photo.width}'});
                            </c:forEach>
                        </c:if>

                        return _config;
                    };
                    window._setGalleryComponentConfiguration.push(initializeInstagramPhotos);

                </script>
            </template:addResources>
        </c:when>
        <c:otherwise>
            <fmt:message key="label_missing_instagram_app_id_secret"/>
        </c:otherwise>
    </c:choose>
</div>