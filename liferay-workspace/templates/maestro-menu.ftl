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
                                                customIconSvg = ""
                                        />

                                        <#-- Map menu item names to custom icons -->
                                        <#if navItemName?contains("Main")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Dashboard") && !navItemName?contains("Your dashboard")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Your dashboard")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 21V19C6 17.9391 6.42143 16.9217 7.17157 16.1716C7.92172 15.4214 8.93913 15 10 15H14C15.0609 15 16.0783 15.4214 16.8284 16.1716C17.5786 16.9217 18 17.9391 18 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("KPI")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="13" width="4" height="8" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="10" y="3" width="4" height="18" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="17" y="8" width="4" height="13" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Risk")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="0.5" fill="currentColor" stroke="currentColor" stroke-width="1"/></svg>' />
                                        <#elseif navItemName?contains("Know Your Customer") || navItemName?contains("KYC")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 16C8 14.5 9.5 14 12 14C14.5 14 16 14.5 16 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Portfolio")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Petitions")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="9" y1="12" x2="15" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="9" y1="16" x2="15" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' />
                                        <#elseif navItemName?contains("Loan")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Deal")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' />
                                        <#elseif navItemName?contains("Workflow") || navItemName?contains("GFD")>
                                                <#assign customIconSvg = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="19" cy="5" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="19" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 7L10.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16.5 7L13.5 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' />
                                        </#if>

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
                                                                <#if customIconSvg?has_content>
                                                                        <span class="maestro-nav-icon">${customIconSvg}</span>
                                                                <#elseif validator.isNull(displayIcon)>
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
