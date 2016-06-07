package org.jahia.modules.instagramfeed.actions;

import org.jahia.bin.Action;
import org.jahia.bin.ActionResult;
import org.jahia.modules.instagramfeed.InstagramManager;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.URLGenerator;
import org.jahia.services.render.URLResolver;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

/**
 * Created by ramiroc on 5/19/2016.
 * This action is used to receive the authorization code from instagram
 * and request the corresponding access token, the token is saved in the
 * gallery node to avoid requesting it multiple times, in case the token
 * expires it needs to be regenerated using the "Refres token" link
 * available in edit mode on the instagram feed component
 */
public class ProcessInstagramToken extends Action {
    @Override
    public ActionResult doExecute(HttpServletRequest httpServletRequest, RenderContext renderContext,
                                  Resource resource, JCRSessionWrapper jcrSessionWrapper, Map<String,
                                List<String>> map, URLResolver urlResolver) throws Exception {

        // obtain the node and redirect node required to process this action
        String code = httpServletRequest.getParameter("code");
        String nodeId = httpServletRequest.getParameter("nid");
        String redirectNodeId = httpServletRequest.getParameter("rid");

        if(code!=null && !code.isEmpty()) {
            JCRNodeWrapper site = renderContext.getSite();
            JCRNodeWrapper instagramGallery = jcrSessionWrapper.getNodeByIdentifier(nodeId);
            // we got the gallerynode, retrieve the appropriate instagram app info to request the code
            if (instagramGallery != null) {
                String clientID = site.getPropertyAsString("instagramApplicationId");
                String clientSecret = site.getPropertyAsString("instagramApplicationSecret");
                //${url.server}${url.base}${renderContext.site.home.path}.processInstagramToken.do?rid=${renderContext.mainResource.node.identifier}&nid=${currentNode.identifier}
                URLGenerator urlGenerator = renderContext.getURLGenerator();
                if (urlGenerator==null)
                    urlGenerator = new URLGenerator(renderContext,resource);

                //the redirectUri must be the same as the one requested
                String redirectURI =
                        String.format("%1s%2s%3s.processInstagramToken.do?rid=%4s&nid=%5s",
                                    urlGenerator.getServer(),
                                    urlGenerator.getBase(),
                                    renderContext.getSite().getHome().getPath(),
                                    redirectNodeId,
                                    nodeId);

                InstagramManager manager = new InstagramManager();
                manager.setClientId(clientID);
                manager.setClientSecret(clientSecret);
                manager.setCallbackUrl(redirectURI);
                manager.setInstagramCode(code);

                String accessToken = manager.getAccessToken();

                if (accessToken!=null && !accessToken.isEmpty())
                {
                    //save the access token
                    instagramGallery.setProperty("accessToken", accessToken);
                    jcrSessionWrapper.save();
                    renderContext.getResponse().getWriter().write("A new access token was received: "
                            + accessToken + " please close this window and refresh the instagram component.");
                }
            }
        }
        return ActionResult.OK;
    }
}
