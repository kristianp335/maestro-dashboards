<#include "${templatesPath}/NAVIGATION-MACRO-FTL" />

<style>
/* Maestro Vertical Navigation Styles */
.maestro-vertical-nav {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
}

.maestro-nav-item {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
}

.maestro-nav-link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    width: 100%;
    color: var(--brand-color-2, #003366);
    text-decoration: none;
    font-size: 0.9375rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 4px;
}

.maestro-nav-link:hover {
    background-color: rgba(0, 166, 81, 0.08);
    color: var(--brand-color-1, #00A651);
    text-decoration: none;
}

.maestro-nav-item.active .maestro-nav-link,
.maestro-nav-item.selected .maestro-nav-link {
    background-color: rgba(0, 166, 81, 0.12);
    color: var(--brand-color-1, #00A651);
    font-weight: 600;
}

.maestro-nav-text {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    flex: 1;
}

.maestro-nav-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.maestro-nav-icon svg {
    width: 20px;
    height: 20px;
}

.maestro-nav-child-toggle {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    transition: transform 0.2s ease;
}

.maestro-nav-item.has-children.open .maestro-nav-child-toggle {
    transform: rotate(180deg);
}

.maestro-child-menu {
    list-style: none;
    margin: 0;
    padding: 0;
    padding-left: 2.5rem;
    display: none;
}

.maestro-nav-item.has-children.open .maestro-child-menu {
    display: block;
}

.maestro-child-menu .maestro-nav-item {
    margin-top: 0.25rem;
}

.maestro-child-menu .maestro-nav-link {
    padding: 0.625rem 1rem;
    font-size: 0.875rem;
    font-weight: 400;
}
</style>

<#if !entries?has_content>
        <#if themeDisplay.isSignedIn()>
                <div class="alert alert-info">
                        <@liferay.language key="there-are-no-menu-items-to-display" />
                </div>
        </#if>
<#else>
        <#assign
                portletDisplay = themeDisplay.getPortletDisplay()
                navbarId = "navbar_" + portletDisplay.getId()
        />

        <div id="${navbarId}">
                <ul aria-label="<@liferay.language key="site-pages" />" class="maestro-vertical-nav" role="menubar">
                        <#assign navItems = entries />

                        <#list navItems as navItem>
                                <#assign
                                        displayIcon = navItem.getDisplayIcon()
                                        showChildrenNavItems = (displayDepth != 1) && navItem.hasBrowsableChildren()
                                        navItemName = navItem.getName()
                                />

                                <#if navItem.isBrowsable() || showChildrenNavItems>
                                        <#assign
                                                nav_item_attr_has_popup = ""
                                                nav_item_caret = ""
                                                nav_item_css_class = "maestro-nav-item"
                                                nav_item_href_link = ""
                                                nav_item_link_css_class = "maestro-nav-link"
                                        />

                                        <#if showChildrenNavItems>
                                                <#assign nav_item_attr_has_popup = "aria-haspopup='true'" />

                                                <#assign nav_item_caret>
                                                        <span class="maestro-nav-child-toggle">
                                                                <@clay["icon"] symbol="angle-down" />
                                                        </span>
                                                </#assign>

                                                <#assign
                                                        nav_item_css_class = "${nav_item_css_class} has-children"
                                                        nav_item_link_css_class = "${nav_item_link_css_class} has-dropdown"
                                                />
                                        </#if>

                                        <#if navItem.isBrowsable()>
                                                <#assign nav_item_href_link = "href='${navItem.getURL()}'" />
                                        </#if>

                                        <#if navItem.isChildSelected() || navItem.isSelected()>
                                                <#assign
                                                        nav_item_css_class = "${nav_item_css_class} selected active"
                                                />
                                        </#if>

                                        <li class="${nav_item_css_class}" id="layout_${portletDisplay.getId()}_${portletDisplay.getId()}_${navItem.getLayoutId()}" role="presentation">
                                                <a ${nav_item_attr_has_popup} class="${nav_item_link_css_class}" ${nav_item_href_link} ${navItem.getTarget()} role="menuitem">
                                                        <span class="maestro-nav-text">
                                                                <#if validator.isNull(displayIcon)>
                                                                        <@liferay_theme["layout-icon"] layout=navItem.getLayout() />
                                                                <#else>
                                                                        <@clay["icon"] symbol="${displayIcon}" />
                                                                </#if>

                                                                ${navItemName} ${nav_item_caret}
                                                        </span>
                                                </a>

                                                <#if showChildrenNavItems>
                                                        <ul aria-expanded="false" class="maestro-child-menu" role="menu">
                                                                <@buildChildrenNavItems
                                                                        displayDepth = displayDepth
                                                                        navItem = navItem
                                                                />
                                                        </ul>
                                                </#if>
                                        </li>
                                </#if>
                        </#list>
                </ul>
        </div>

        <@liferay_aui.script use="liferay-navigation-interaction">
                var navigation = A.one('#${navbarId}');

                Liferay.Data.NAV_INTERACTION_LIST_SELECTOR = '.maestro-vertical-nav';
                Liferay.Data.NAV_LIST_SELECTOR = '.maestro-vertical-nav';

                if (navigation) {
                        navigation.plug(Liferay.NavigationInteraction);
                }
        </@>
</#if>
