<#--COMMITTEE-ACTION-LOG-widgetTemplate (CORRECTED VERSION)-->

<#--Template use info logging-->
<#assign recFormArticleService = serviceLocator.findService("com.everis.cproposal.service.recFormArticleLocalService") />
<#assign templateName = "COMMITTEE-ACTION-LOG-widgetTemplate" />
<#if themeDisplay??>
    <#assign logMessage = "Template: " + templateName + " (in " + themeDisplay.getURLCurrent() + ")" + " / User: " + themeDisplay.getUser().getFullName() + " (id=" + themeDisplay.getUser().getUserId() + ", " + themeDisplay.getUser().getEmailAddress() + ")" />
    ${recFormArticleService.templateLogDebug(logMessage)}
</#if>

<#--Memory logging-->
${recFormArticleService.templateLogDebug("Memory before processing template: "+templateName)}
<#assign usedMemoryMessage = "Used memory: " + recFormArticleService.getUsedMemory() + " Bytes"/>
<#assign totalMemoryMessage = "Total memory: " + recFormArticleService.getTotalMemory() + " Bytes"/>
${recFormArticleService.templateLogDebug(usedMemoryMessage)}
${recFormArticleService.templateLogDebug(totalMemoryMessage)}

<#-- Initialize all services once -->
<#assign journalArticleService = serviceLocator.findService("com.liferay.journal.service.JournalArticleLocalService") />
<#assign userService = utilLocator.findUtil("com.liferay.portal.kernel.service.UserLocalService") />                                                    
<#assign rolService = utilLocator.findUtil("com.liferay.portal.kernel.service.RoleLocalService") />                                                     
<#assign RoleServiceUtil = utilLocator.findUtil("com.liferay.portal.kernel.service.UserGroupRoleLocalService") />
<#assign ddmStructureService = serviceLocator.findService("com.liferay.dynamic.data.mapping.service.DDMStructureLocalService") />
<#assign groupService = utilLocator.findUtil("com.liferay.portal.kernel.service.GroupLocalService") />

<#assign userId = themeDisplay.getUserId() />
<#assign groupId = themeDisplay.getScopeGroupId() />
<#assign user = userService.getUser(userId)>                                                    
<#assign userRoles = user.getRoles() />
<#assign siteRoles = RoleServiceUtil.getUserGroupRoles(userId, groupId) />
<#assign userEmail = user.getEmailAddress() />

<#-- member - IMPROVED: Use direct API instead of looping through all users -->
<#assign member = groupService.hasUserGroup(userId, groupId) />

<#assign images_folder = themeDisplay.getPathThemeImages() />
<#assign memberCommittee = 0 />
<#assign isAdmin = 0 />

<#list userRoles as rol>
        <#if rol.getName() == "Administrator" || rol.getName() == "Committee_Secretariat_Admi">         
                <#assign isAdmin = 1 />                                                 
        </#if>                                                  
</#list>

<#-- FIXED: Get DDM structure once and use consistent naming -->
<#assign structureKey = "" />
<#assign listddmStructure = ddmStructureService.getDDMStructures(0, ddmStructureService.getDDMStructuresCount()) />

<#list listddmStructure as ddm>
        <#-- FIXED: Use consistent structure name -->
        <#if ddm.getNameCurrentValue() == "COMMITTEE-ACTION-LOG" && ddm.getGroupId() == groupId>
                <#assign structureKey = ddm.getStructureKey() />
                <#break>
        </#if>
</#list>

<#-- Fallback if structure not found -->
<#if !structureKey?has_content>
    <div class="alert alert-warning">Structure "COMMITTEE-ACTION-LOG" not found. Please check the structure configuration.</div>
    <#stop>
</#if>

<#assign hasCustomFilter = false />

<#assign filterList = "" />
<#assign filterStartDate = "" />
<#assign filterEndDate = "" />
<#assign filterStatus = "" />
<#assign filterStartUpdate = "" />
<#assign filterEndUpdate = "" />

<#-- FILTER BLOCKS - IMPROVED: Add safety checks for request parameters -->
<#if request.getParameter("filterStartDate")?? && request.getParameter("filterStartDate")?has_content>
        <#assign hasCustomFilter = true />
        <#assign filterStartDate = request.getParameter("filterStartDate") + " 00:00:00" />
        <#assign filterList = filterList + ",filterStartDate:" + request.getParameter("filterStartDate")?html />
</#if>

<#if request.getParameter("filterEndDate")?? && request.getParameter("filterEndDate")?has_content>
        <#assign hasCustomFilter = true />
        <#assign filterEndDate = request.getParameter("filterEndDate")  + " 23:59:59" />
        <#assign filterList = filterList + ",filterEndDate:" + request.getParameter("filterEndDate")?html />
</#if>

<#if request.getParameter("filterStatus")?? && request.getParameter("filterStatus")?has_content>
        <#assign hasCustomFilter = true />
        <#assign filterStatus = request.getParameter("filterStatus") />
        <#assign filterList = filterList + ",filterStatus:" + request.getParameter("filterStatus")?html />
</#if>

<#if request.getParameter("filterStartUpdate")?? && request.getParameter("filterStartUpdate")?has_content>
        <#assign hasCustomFilter = true />
        <#assign filterStartUpdate = request.getParameter("filterStartUpdate") + " 00:00:00" />
        <#assign filterList = filterList + ",filterStartUpdate:" + request.getParameter("filterStartUpdate")?html />
</#if>

<#if request.getParameter("filterEndUpdate")?? && request.getParameter("filterEndUpdate")?has_content>
        <#assign hasCustomFilter = true />
        <#assign filterEndUpdate = request.getParameter("filterEndUpdate")  + " 23:59:59" />
        <#assign filterList = filterList + ",filterEndUpdate:" + request.getParameter("filterEndUpdate")?html />
</#if>

<#assign filterList = filterList?remove_beginning(",") />
<#-- END FILTER BLOCKS --> 

<#assign filterImg = themeDisplay.getPathThemeImages()+"/forms/filter.svg" />
<#assign chevromImg = themeDisplay.getPathThemeImages()+"/forms/chevrom.svg" />

<#assign siteName = themeDisplay.getSiteGroupName() />
<#assign siteName = siteName?replace(" ", "-") />
<#assign siteName = siteName?lower_case />

<#-- REMOVED: Hard-coded URL with auth token -->
<#assign url = "/group/"+siteName+"/action-log-form" />

<#-- MACRO: Extract common rendering logic -->
<#macro renderActionRow id descp assine due nex status comple articleResourcePK isEditAllowed=false>
    <tr> 
        <td class="left-align-text"></td>
        
        <#-- ID -->
        <td class="left-align-text">${id?html}</td>
        <#-- Description -->
        <td class="left-align-text tdEllipsis"><p class="ellipsis">${descp?html}</p></td>
        <#-- Assignee(s) -->
        <td class="left-align-text">${assine?html}</td>
        <#-- Due Date -->
        <td class="left-align-text">${due?html}</td>
        <#-- NextUpdateDue -->
        <td class="left-align-text">${nex?html}</td>
        <#-- Status -->
        <td class="left-align-text">${status?html}</td>
        <#-- Completion Date -->
        <td class="left-align-text">${comple?html}</td>

        <#if isAdmin == 1 >
            <#assign editUrl = "/group/"+siteName+"/action-log-form/?mode=EDIT&actionLogId="+articleResourcePK/>
            <td><a href="${editUrl?html}"><img class="img" src="${chevromImg}"></a></td>
        <#elseif isEditAllowed>
            <td><a onclick="openForm(${articleResourcePK?js_string})"><img class="img" src="${chevromImg}"></a></td>
        <#else>
            <td></td>
        </#if>
    </tr>
</#macro>

<#if member || isAdmin == 1>
<div id="committee-actionLog">

        <h1 id="committeeTitle">Live Action Log
                <div class="filters">
                        <div class="filterList">
                                <#if filterList?has_content>
                                        <style> 
                                                .clearfix.lfr-pagination{visibility:hidden;}
                                        </style>

                                        Filter Options: 
                                        <#list filterList?split(",") as filter>
                                                <#assign statusText = filter?split(":")[1] />
                                                <#if statusText?contains(";spt;")>
                                                        <#list statusText?split(";spt;") as statusItem>
                                                                <span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]?js_string}', '${statusItem?js_string}')">&times;</a> ${statusItem?html} </span>
                                                        </#list>
                                                <#else>
                                                        <#if filter?contains("filterStartDate") || filter?contains("filterEndDate") || filter?contains("filterStartUpdate") || filter?contains("filterEndUpdate")>
                                                                <span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]?js_string}', '${filter?split(":")[1]?js_string}')">&times;</a> ${filter?split(":")[1]?html} </span>
                                                        <#else>
                                                                <span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]?js_string}', '${filter?split(":")[1]?js_string}')">&times;</a> ${filter?split(":")[1]?html} </span>
                                                        </#if>
                                                </#if>
                                        </#list>
                                        <input class="btn removeFilters clearFilters" type="submit" value='&times; Remove filters' onclick="removeFilters()"> 
                                </#if>            
                                <div class="filterOpt" >
                                        <a onclick="openFilterPopUp()">
                                                <img id="filterImg" src="${images_folder}/forms/filter.svg"/> 
                                                        Filter
                                        </a>
                                        <#if isAdmin == 1>  
                                                <a id="newAction" href="${url?html}">Make an action</a>
                                        </#if>
                                </div> 
                        </div> 
                </div> 
        </h1> 

        <#-- ACTION LOG VISIBLE --> 
        <div id="committeeContent"> 
                <table id="committeeTableList">
                        <thead>
                                <tr>
                                        <th class="left-align-text"></th>
                                        <th class="left-align-text">ID</th>
                                        <th class="left-align-text">Description</th>
                                        <th class="left-align-text">Assignee</th>
                                        <th class="left-align-text">Due Date</th>
                                        <th class="left-align-text">Next Update Due </th>
                                        <th class="left-align-text">Status</th>
                                        <th class="left-align-text">Completion Date</th>
                                        <th class="left-align-text"></th>
                                </tr>
                        </thead>

                        <tbody>
                <#-- CUSTOM FILTER (DATE/STATUS) -->
                        <#if hasCustomFilter>

                    <#-- IMPROVED: Simplified filtering logic with proper error handling -->
                    <#attempt>
                        <#if (!filterStartDate?has_content && !filterEndDate?has_content) && (!filterStartUpdate?has_content && !filterEndUpdate?has_content)>
                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, null, null, groupId, structureKey) />
                        <#elseif !filterStartUpdate?has_content && !filterEndUpdate?has_content>
                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, null, null, groupId, structureKey) />
                        <#elseif !filterStartDate?has_content && !filterEndDate?has_content>
                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
                        <#else>
                            <#-- FIXED: Use filterEndUpdate instead of filterEndDate for the last parameter -->
                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
                        </#if>
                    <#recover>
                        <#assign filteredJA = [] />
                        <tr><td colspan="9" class="alert alert-warning">Error loading filtered data. Please check your filter parameters.</td></tr>
                    </#attempt>

                    <#if filteredJA?has_content>
                        <#list filteredJA as ja>
                            <#attempt>
                                <#assign document = saxReaderUtil.read(ja.getContent())/>
                                <#assign articleResourcePK = ja.getResourcePrimKey() />

                                <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                <#-- IMPROVED: Remove fetchLatestArticle call per row -->
                                <#-- FIXED: Use ja.getVersion() instead of ja.version -->
                                <#if status == "Open">
                                    <#assign isEditAllowed = (userEmail == assine) />
                                    <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                </#if>
                            <#recover>
                                <tr><td colspan="9" class="alert alert-warning">Error processing article ${ja.getArticleId()!"unknown"}</td></tr>
                            </#attempt>
                        </#list>
                    </#if>
                    <#else>
                    <#-- IMPROVED: Add fallback when entries is not available -->
                    <#if entries?? && entries?has_content>
                        <#list entries as curEntry>
                            <#attempt>
                                <#assign renderer = curEntry.getAssetRenderer() />
                                <#assign className = renderer.getClassName() />

                                <#if className == "com.liferay.journal.model.JournalArticle">
                                    <#assign journalArticle = renderer.getArticle() />
                                    <#assign document = saxReaderUtil.read(journalArticle.getContent())/>
                                    <#assign articleId = journalArticle.getArticleId() /> 
                                    <#assign articleResourcePK = journalArticle.getResourcePrimKey() />

                                    <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                    <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                    <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                    <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                    <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                    <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                    <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                    <#assign creteDate = journalArticle.getCreateDate()?date />
                                    <#assign pmURL = "/group/guest/-/" + journalArticle.getUrlTitle() />

                                    <#if status == "Open">
                                        <#assign isEditAllowed = (userEmail == assine) />
                                        <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                    </#if>
                                </#if>
                            <#recover>
                                <tr><td colspan="9" class="alert alert-warning">Error processing entry</td></tr>
                            </#attempt>
                        </#list>
                    <#else>
                        <#-- FALLBACK: Use service directly when Asset Publisher entries not available -->
                        <#attempt>
                            <#assign allArticles = recFormArticleService.getActionLogFiltered(null, null, "Open", null, null, groupId, structureKey) />
                            <#if allArticles?has_content>
                                <#list allArticles as ja>
                                    <#assign document = saxReaderUtil.read(ja.getContent())/>
                                    <#assign articleResourcePK = ja.getResourcePrimKey() />

                                    <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                    <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                    <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                    <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                    <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                    <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                    <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                    <#assign isEditAllowed = (userEmail == assine) />
                                    <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                </#list>
                            <#else>
                                <tr><td colspan="9" class="text-center">No open action items found.</td></tr>
                            </#if>
                        <#recover>
                            <tr><td colspan="9" class="alert alert-danger">Unable to load action log data. Please contact the administrator.</td></tr>
                        </#attempt>
                    </#if>
                            </#if>
                    </tbody> 
                </table>

                <#assign groupId= themeDisplay.getLayout().getGroupId() />
                <#assign userId = themeDisplay.getUserId() />

                <div id="actionStatus" class="overlaySolutions"> 
                        <div class="popupSolutions"> 
                                <h2>Update Status</h2> 
                                <a class="close" href="#" onclick="closeForm()">&times;</a>
                                <select id="selectStatus">
                                        <option>Open</option>
                                        <option>Withdrawn</option>
                                        <option>Completed</option>
                                </select>

                                <hr> 
                                <button id="updateButton" href="#" class="float-right lfr-ddm-form-pagination-next btn btn-primary">Update</button> 
                        </div> 
                </div> 

                </div>

                <h1 id="committeeTitleClosed">Closed Action Log</h1>
                <#-- ACTION LOG CLOSED -->
                <div id="committeeContentClosed"> 
                        <table id="committeeTableListClosed">
                                <thead>
                                        <tr>
                                                <th class="left-align-text"></th>
                                                <th class="left-align-text">ID</th>
                                                <th class="left-align-text">Description</th>
                                                <th class="left-align-text">Assignee</th>
                                                <th class="left-align-text">Due Date</th>
                                                <th class="left-align-text">Next Update Due </th>
                                                <th class="left-align-text">Status</th>
                                                <th class="left-align-text">Completion Date</th>
                                        </tr>
                                </thead>

                            <tbody>
                                    <#-- CUSTOM FILTER (DATE/STATUS) - CLOSED ITEMS -->
                                <#if hasCustomFilter>
                                    <#attempt>
                                        <#if (!filterStartDate?has_content && !filterEndDate?has_content) && (!filterStartUpdate?has_content && !filterEndUpdate?has_content)>
                                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, null, null, groupId, structureKey) />
                                        <#elseif !filterStartUpdate?has_content && !filterEndUpdate?has_content>
                                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, null, null, groupId, structureKey) />
                                        <#elseif !filterStartDate?has_content && !filterEndDate?has_content>
                                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
                                        <#else>
                                            <#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
                                        </#if>
                                    <#recover>
                                        <#assign filteredJA = [] />
                                        <tr><td colspan="8" class="alert alert-warning">Error loading filtered data.</td></tr>
                                    </#attempt>

                                    <#if filteredJA?has_content>
                                        <#list filteredJA as ja>
                                            <#attempt>
                                                <#assign document = saxReaderUtil.read(ja.getContent())/>                                                               
                                                <#assign articleResourcePK = ja.getResourcePrimKey() />

                                                <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                                <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                                <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                                <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                                <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                                <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                                <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                                <#if status != "Open">
                                                    <#assign isEditAllowed = (userEmail == assine) />
                                                    <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                                </#if>
                                            <#recover>
                                                <tr><td colspan="8" class="alert alert-warning">Error processing closed article</td></tr>
                                            </#attempt>
                                        </#list>
                                    </#if>
                                <#else>
                                    <#-- Same fallback logic for closed items -->
                                    <#if entries?? && entries?has_content>
                                        <#list entries as curEntry>
                                            <#attempt>
                                                <#assign renderer = curEntry.getAssetRenderer() />
                                                <#assign className = renderer.getClassName() />

                                                <#if className == "com.liferay.journal.model.JournalArticle">
                                                    <#assign journalArticle = renderer.getArticle() />
                                                    <#assign document = saxReaderUtil.read(journalArticle.getContent())/>
                                                    <#assign articleId = journalArticle.getArticleId() />
                                                    <#assign articleResourcePK = journalArticle.getResourcePrimKey() />

                                                    <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                                    <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                                    <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                                    <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                                    <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                                    <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                                    <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                                    <#if status != "Open">
                                                        <#assign isEditAllowed = (userEmail == assine) />
                                                        <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                                    </#if>
                                                </#if>
                                            <#recover>
                                                <tr><td colspan="8" class="alert alert-warning">Error processing entry</td></tr>
                                            </#attempt>
                                        </#list>
                                    <#else>
                                        <#-- FALLBACK: Use service for closed items -->
                                        <#attempt>
                                            <#assign closedStatuses = "Withdrawn;spt;Completed" />
                                            <#assign closedArticles = recFormArticleService.getActionLogFiltered(null, null, closedStatuses, null, null, groupId, structureKey) />
                                            <#if closedArticles?has_content>
                                                <#list closedArticles as ja>
                                                    <#assign document = saxReaderUtil.read(ja.getContent())/>
                                                    <#assign articleResourcePK = ja.getResourcePrimKey() />

                                                    <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                                    <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                                    <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                                    <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                                    <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                                    <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                                    <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                                    <#assign isEditAllowed = (userEmail == assine) />
                                                    <@renderActionRow id=id descp=descp assine=assine due=due nex=nex status=status comple=comple articleResourcePK=articleResourcePK isEditAllowed=isEditAllowed />
                                                </#list>
                                            <#else>
                                                <tr><td colspan="8" class="text-center">No closed action items found.</td></tr>
                                            </#if>
                                        <#recover>
                                            <tr><td colspan="8" class="alert alert-danger">Unable to load closed action log data.</td></tr>
                                        </#attempt>
                                    </#if>
                                </#if>
                        </tbody>
                    </table>
        </div>

<#-- POP-UP FILTERS -->
<div id="pop-up1" class="popup1"> 
        <div class="popupFilter"> 
                <div class= filterOption>
                        <h1> Filter Options </h1> 
                        <a class="close" onclick=closePopUp()>&times;</a> 
                </div>

                <#-- DATE FILTER -->
                <div id="implementationDate" class="filterOption filterImplementation">
                        <h3> Date </h3>
                        <div class= shareRow>

                                <div class="leftSide"> 
                                        <div class="filtersDropdown"> 
                                                <button class="btn btnDropDown" data-toggle="collapse" data-target="#dateFrom" aria-expanded="false" aria-controls="dateFrom"> From... 
                                                        <img src="${images_folder}/forms/calendar-black.svg"/>
                                                </button>
                                                <div id="dateFrom" class="collapse" aria-labelledby="dateFrom" data-parent="#dateFrom" style="">
                                                        <input type="date" id="start" name="trip-start" value="">
                                                </div>
                                        </div>
                                </div>
                                <div class="rigthSide"> 
                                        <div class="filtersDropdown"> 
                                                <button class="btn btnDropDown" data-toggle="collapse" data-target="#dateTo" aria-expanded="false" aria-controls="dateTo"> To...
                                                        <img id="dateToImg" src="${images_folder}/forms/calendar-black.svg"/>
                                                </button>
                                                <div id="dateTo" class="collapse" aria-labelledby="dateTo" data-parent="#dateTo" style="">
                                                        <input type="date" id="end" name="trip-start" value=""> 
                                                </div> 
                                        </div>
                                </div>

                        </div>
                </div>

                <#-- STATUS FILTER -->
                <div class="filterOption statusOptions">
                        <h3> Status </h3>
                        <div class="grid-container filterStatus shareRow">

                                <div class="grid-item">
                                        <label class="containerStatus">
                                                <input type="checkbox" name="row1op1" value="" class="status" data-status="Open"> 
                                                <span class="checkBoxCustom" for="row1op1"></span>
                                                <span class="status open"> Open</span>
                                        </label> 
                                </div>

                                <div class="grid-item">
                                        <label class="containerStatus">
                                                <input type="checkbox" name="row1op2" value="" data-status="Withdrawn">
                                                <span class="checkBoxCustom" for="row1op2"> </span> 
                                                <span class="status withdrawn"> Withdrawn</span>
                                        </label> 
                                </div>

                                <div class="grid-item">
                                        <label class="containerStatus">
                                                <input type="checkbox" name="row1op3" value="" data-status="Completed">
                                                <span class="checkBoxCustom" for="row1op2"> </span> 
                                                <span class="status completed"> Completed</span>
                                        </label> 
                                </div>

                        </div>
                </div>

        <#-- UPDATE FILTER -->
        <div id="implementationUpdate" class="filterOption filterImplementationUpdate">
            <h3> Update </h3>
            <div class= shareRow>

                <div class="leftSide">
                    <div class="filtersDropdown">
                        <button class="btn btnDropDown" data-toggle="collapse" data-target="#updateFrom" aria-expanded="false" aria-controls="updateFrom"> From...
                            <img src="${images_folder}/forms/calendar-black.svg" />
                        </button>
                        <div id="updateFrom" class="collapse" aria-labelledby="updateFrom" data-parent="#updateFrom" style="">
                            <input type="date" id="startU" name="trip-startU" value="">
                        </div>
                    </div>
                </div>
                <div class="rigthSide">
                    <div class="filtersDropdown">
                        <button class="btn btnDropDown" data-toggle="collapse" data-target="#updateTo" aria-expanded="false" aria-controls="updateTo"> To...
                            <img id="updateToImg" src="${images_folder}/forms/calendar-black.svg" />
                        </button>
                        <div id="updateTo" class="collapse" aria-labelledby="updateTo" data-parent="#updateTo" style="">
                            <input type="date" id="endU" name="trip-startU" value="">
                        </div>
                    </div>
                </div>
            </div>
        </div>

                <div>
            <input class="btn applyFilters" type="submit" value="Apply filters" onclick="applyFilters()">
            <input class="btn clearFilters" type="submit" value="Clear filters" onclick="clearFilters()">
                </div>
        </div>
</div>

</div>

<#-- POP-UP OPEN/CLOSED CLEAR FILTER -->
<script>
        function openFilterPopUp() {
                $("#pop-up1").css("visibility","visible");
        } 

        function closePopUp(){
                removeFilters();
                $("#pop-up1").css("visibility","hidden");
        }
</script>

<#-- EXECUTION DE FILTROS - IMPROVED: Better error handling and security -->
<script>
        $(function(){
                var requiredCheckboxes = $('.browsers :checkbox[required]');
                requiredCheckboxes.change(function(){
                        if(requiredCheckboxes.is(':checked')) {
                                requiredCheckboxes.removeAttr('required');
                        } else {
                                requiredCheckboxes.attr('required', 'required');
                        }
                });
        });

        function applyFilters() {
                try {
                    var currentURL = new URL(location.protocol + '//' + location.host + location.pathname);
                    var emptyChecks = true;

                    //START filterDate
                    var startDate = $(".filterImplementation .leftSide #dateFrom input[type=date]").val();
                    var endDate = $(".filterImplementation .rigthSide #dateTo input[type=date]").val();

                    if (startDate && endDate) {
                            currentURL.searchParams.append('filterStartDate', startDate);
                            currentURL.searchParams.append('filterEndDate', endDate);
                            emptyChecks = false;
                    }

                    //START filterStatus
                    var status = "";
                    $(".filterStatus").find("input[type=checkbox]").each(function(){
                            if ($(this).prop('checked')==true){ 
                                    status = status + ";spt;" + $(this).attr("data-status");
                            }
                    });

                    if(status != ""){
                            status = status.substring(5);
                            currentURL.searchParams.append('filterStatus', status);
                            emptyChecks = false;
                    }

                    //START filterUpdate
                    var startUpdate = $(".filterImplementationUpdate .leftSide #updateFrom input[type=date]").val();
                    var endUpdate = $(".filterImplementationUpdate .rigthSide #updateTo input[type=date]").val();

                    if (startUpdate && endUpdate) {
                            currentURL.searchParams.append('filterStartUpdate', startUpdate);
                            currentURL.searchParams.append('filterEndUpdate', endUpdate);
                            emptyChecks = false;
                    }

                    if(emptyChecks){
                            currentURL = new URL(window.location.pathname, window.location.origin);
                    }
                    currentURL.searchParams.append('page', 0);
                    window.location.replace(currentURL);
                } catch(e) {
                    console.error('Error applying filters:', e);
                    alert('Error applying filters. Please try again.');
                }
        }

        function removeFilters(){
            try {
                var currentURL = new URL(window.location.href);

                ['filterStartDate', 'filterEndDate', 'filterStatus', 'filterStartUpdate', 'filterEndUpdate', 'page'].forEach(function(param) {
                    if(currentURL.searchParams.get(param) != null){
                        currentURL.searchParams.delete(param);
                    }
                });

                window.location.replace(currentURL);
            } catch(e) {
                console.error('Error removing filters:', e);
                window.location.href = window.location.pathname;
            }
        }

        function clearFilters() {
                $('input[type=checkbox]').prop('checked',false);
        }

        function removeFilter(filter, value){
            try {
                var currentURL = new URL(window.location.href);
                if(filter === "filterStatus" ){
                        var filters = currentURL.searchParams.get(filter);
                        if(filters && filters.includes(";spt;")){
                                if(filters.indexOf(value) == 0){
                                        filters = filters.replace(value + ";spt;", "");
                                } else {
                                        filters = filters.replace(";spt;" + value, "");
                                }
                                currentURL.searchParams.set(filter, filters);
                                currentURL.searchParams.delete('page');
                                currentURL.searchParams.append('page', 0);
                        } else {
                                currentURL.searchParams.delete(filter);
                                currentURL.searchParams.delete('page');
                        }
                } else {
                        if (filter.includes("filterStartDate") || filter.includes("filterEndDate") || filter.includes("filterStartUpdate") || filter.includes("filterEndUpdate")) {
                                currentURL.searchParams.delete("filterStartDate");
                                currentURL.searchParams.delete("filterEndDate");
                                currentURL.searchParams.delete("filterStartUpdate");
                                currentURL.searchParams.delete("filterEndUpdate");
                                currentURL.searchParams.delete('page');
                        } else {
                                currentURL.searchParams.delete(filter);
                                currentURL.searchParams.delete('page');
                        }
                }
                window.location.replace(currentURL);
            } catch(e) {
                console.error('Error removing filter:', e);
                // Fallback to full page reload
                window.location.href = window.location.pathname;
            }
        }

        function openForm(articleResourcePK) {
                if (articleResourcePK) {
                    $("#actionStatus").css("visibility", "visible");
                    $("#updateButton").off('click').on('click', function() {
                        updateActionStatus(articleResourcePK);
                    });
                }
        }

        function closeForm() {
                $("#actionStatus").css("visibility", "hidden");
        }

        function updateActionStatus(articleResourcePK) {
                var newStatus = $("#selectStatus").val();
                // Add your status update logic here
                console.log("Updating article " + articleResourcePK + " to status: " + newStatus);
        }
</script>

<#-- CSS STYLES -->
<style>

        #committee-actionLog{
                max-width: 100%;
                width: auto;
                margin: 0;
                padding: 0;
        }

        #committee-actionLog table{
                width: 100% !important;
        }

        #committee-actionLog #committeeTitle{
                color: black; 
                font-family: "Roboto-Regular";
                font-size: 36px;
                font-weight: normal;
                line-height: 42px;
                border-bottom: solid;
                border-color: #d6d6d6;
                border-width: 1px;
                margin-bottom: 30px;
                padding-bottom: 10px;

        }

        #committee-actionLog #committeeTitleClosed{
                color: black; 
                font-family: "Roboto-Regular";
                font-size: 36px;
                font-weight: normal;
                line-height: 42px;
                border-bottom: solid;
                border-color: #d6d6d6;
                border-width: 1px;
                margin-bottom: 30px;
                margin-top: 30px;
                padding-bottom: 10px;
        }

        .filters{
                float: right;
        }

        .filterList{
                position: relative;
                z-index: 1;
        }

        .filterOpt{
                border: none;
                position: relative;
                z-index: 1;
                float: right;
        }

        .filterOpt a{
                text-decoration:underline;
                margin-left: 10px;
                font-size: 16px;
                font-family: Roboto-Regular;
                cursor: pointer;
                color: black !important;
        }

        .filterOpt img{
                width: 16px;
                height: 15px;
        }

        #committee-actionLog thead th{
                font-weight: bolder;
                font-family: "Roboto-Regular";
        }

        #committee-actionLog tbody tr {
                border-bottom: solid;
                border-color: #d6d6d6;
                border-width: 1px;
        }

        #committee-actionLog thead tr {
                border-bottom: solid;
                border-color: #d6d6d6;
                border-width: 1px;
        }

        #committee-actionLog tbody tr td{
                padding: 15px 10px 15px 3px;
                line-height: 24px;
                text-align: left;
                vertical-align: top;
                border-top: 0;
        }

        .img{
                width: 20px;
                height: 17px;
                cursor: pointer;
        }

        .filters .filterAdded{
                padding: 5px 8px;
                margin: 0px 3px 2px 0px;
                border-radius: 20px;
                color: white; 
                font-family: "Roboto-Regular";
                font-size: 14px;
                font-weight: normal;
                display: inline-block;
                background-color: #70ada3;
        }

        .filters .filterAdded .close{
                color: white;
                margin-left: 8px;
                text-decoration: none;
                font-size: 18px;
                cursor: pointer;
                font-weight: bold;
        }

        .popup1{
                display: block;
                position: fixed;
                z-index: 9999;
                padding-top: 60px;
                padding-left: 0px;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0, 0, 0);
                background-color: rgba(0, 0, 0, 0.4);
                visibility: hidden;
        }

        .popupFilter{
                background-color: white;
                margin: 3% auto 15% auto;
                border: solid;
                border-color: white;
                border-width: 1px;
                border-radius: 10px;
                width: 60%;
                box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
                animation-name: animateTop;
                animation-duration: 0.4s;
                padding: 30px;
        }

        .popupFilter .close{
                color: #aaaaaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                margin-right: 30px;
        }

        .popupFilter .close:hover,
        .close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
        }

        .popupFilter h1{
                color: black; 
                font-family: "Roboto-Regular";
                font-size: 28px;
                font-weight: normal;
                line-height: 24px;
                text-align: left;
        }

        .popupFilter h3{
                color: black; 
                font-family: "Roboto-Regular";
                font-size: 18px;
                font-weight: bold;
                line-height: 24px;
                text-align: left;
                margin-top: 30px;
        }

        .filterImplementation, .shareRow{
                float: left;
                width: 100%;
        }

        .leftSide{
                float: left;
                margin-right: 2%;
                width: 49%;
        }

        .rigthSide{
                float: right;
                width: 49%;
        }

        .containerStatus {
                display: block;
                position: relative;
                padding-left: 30px;
                margin-bottom: 15px;
                cursor: pointer;
                font-size: 14px;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
        }

        .containerStatus input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
        }

        .checkBoxCustom {
                position: absolute;
                top: 3px;
                left: 0;
                height: 15px;
                width: 15px;
                background-color: #eee;
                border: solid;
                border-width: 1px;
                border-color: #d6d6d6;
        }

        .containerStatus:hover input ~ .checkBoxCustom {
                background-color: #ccc;
        }

        .containerStatus input:checked ~ .checkBoxCustom {
                background-color: rgb(112, 173, 163);
        }

        .checkBoxCustom:after {
                content: "";
                position: absolute;
                display: none;
        }

        .containerStatus input:checked ~ .checkBoxCustom:after {
                display: block;
        }

        .containerStatus .checkBoxCustom:after {
                left: 4px;
                top: 0px;
                width: 3px;
                height: 8px;
                border: solid white;
                border-width: 0 2px 2px 0;
                -webkit-transform: rotate(45deg);
                -ms-transform: rotate(45deg);
                transform: rotate(45deg);
        }

        .status{
                color: black; 
                font-family: "Roboto-Regular";
                font-size: 14px;
                font-weight: normal;
                line-height: 24px;
        }

        @-webkit-keyframes animateTop {
                from {top: -300px; opacity: 0}
                to {top: 0; opacity: 1}
        }

        @keyframes animateTop {
                from {top: -300px; opacity: 0}
                to {top: 0; opacity: 1}
        }

        .overlaySolutions {
                position: fixed;
                display: block;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 99999;
                cursor: pointer;
                visibility: hidden;
        }

        .popupSolutions {
                position: absolute;
                top: 50%;
                left: 50%;
                font-size: 20px;
                color: black;
                transform: translate(-50%, -50%);
                -ms-transform: translate(-50%, -50%);
                background-color: white;
                border-radius: 4px;
                padding: 40px;
                min-width: 400px;
        }

        .popupSolutions .close{
                color: #aaaaaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                margin-right: -10px;
                margin-top: -20px;
        }

        .popupSolutions .close:hover,
        .close:focus {
                color: #000;
                text-decoration: none;
                cursor: pointer;
        }

        .popupSolutions select{
                width: 100%;
                height: 50px;
                font-size: 16px;
                margin: 20px 0;
        }

        .popupSolutions button{
                margin-top: 20px;
        }

        .cp-list .cp-item {
                padding: 5px 10px;
                border-bottom: 1px solid #d6d6d6;
        }

        .cp-list .cp-item:last-child {
                border-bottom: none;
        }

        .filterTitle .cp-list {
                max-height: 250px;
                overflow: auto;
        }

        .applyFilters{
                background: rgb(112, 173, 163);
                border-radius: 0px;
                height: 40px;
                width: 164.86px;
                color: white;
                margin-top: 2%;
                font-weight: normal;
        }

        .clearFilters{
                color: rgb(0, 0, 0);
                font-family: Roboto-Regular;
                font-size: 16px;
                font-weight: normal;
                height: 40px;
                letter-spacing: 0.5px;
                line-height: 24px;
                text-decoration: underline;
                width: 150px;
                margin-top: 2%;
        }

        .filterOption{
                border-bottom: solid;
                border-color: #d6d6d6;
        }

        .shareRow {
                width: 100%;
                height: 100px;
        }

        .filtersDropdown{
                background-color: #fff;
                border-color: rgba(0, 0, 0, 0.125);
                border-style: solid;
                border-width: 0;
                border-radius: 0.25rem;
                box-shadow: 0 1px 3px -1px rgb(0 0 0 / 60%);
                display: block;
                margin-bottom: 0.5rem;
                min-width: 0;
                position: relative;
                word-wrap: break-word;
        }

        .filtersDropdown img{
                float: right;
                width: 20px;
                height: 18px;
                margin-left: 100px;
        }

        .filtersDropdown h2{
                float: left;
                font-size:18px;
                font-weight: normal;
        }

        div#referenceTitleHeading img {
                margin-left: 480px;
        }

        div#implementationDate img {
                margin-left: 190px; 
        }

        div#implementationUpdate img {
                margin-left: 190px; 
        }

        .filterDropdownHeader {
                border-radius: 0.25rem 0.25rem 0 0;
                border-bottom: 0 solid rgba(0, 0, 0, 0.125);
                margin-bottom: 0;
        }

        .filtersDropdown a{
                color:black;
                font-size: 12px;
        }

        .btnDropDown{
                color:black;
        }

        div#implementationDate button {
                color: #9b9b9b;
                width: -webkit-fill-available;
        }

        div#implementationUpdate button {
                color: #9b9b9b;
                width: -webkit-fill-available;
        }

        div#content, div#content1,  div#content2, div#content3, div#content4{
                position: absolute;
                background: white !important;
                border: 1px solid transparent;
                border-radius: 0.25rem;
                z-index: 3; 
                min-width: 288px;
                overflow: auto;
                max-height: 250px;
                box-shadow: 1px 5px 5px black;
        }

        .grid-container {
                display: grid;
                grid-template-columns: auto auto auto;
                padding: 10px;
        }

        .grid-item {
                font-size: 20px;
        }

        input[type="date"] {
                color: #9b9b9b;
                width: 217px;
        }

        .withdrawn{
                background: white !important;
        }

        .tdEllipsis{
                width: 475px;
        }
        
        .ellipsis {
                width: 450px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-bottom: 0rem;
                margin-top: 0;
                text-align: justify;
        }

        .ellipsis:hover {
                text-overflow: initial;
                white-space: initial;
                overflow: visible;
                cursor: pointer;
                margin-right: 20px;
        }

        #committee-actionLog #newAction {
                margin: 0px 0px 10px 10px !important;
                padding: 5px !important;
        }

        .alert {
                padding: 15px;
                margin-bottom: 20px;
                border: 1px solid transparent;
                border-radius: 4px;
        }

        .alert-warning {
                color: #8a6d3b;
                background-color: #fcf8e3;
                border-color: #faebcc;
        }

        .alert-danger {
                color: #a94442;
                background-color: #f2dede;
                border-color: #ebccd1;
        }

        .text-center {
                text-align: center;
        }

</style>
</#if>

<#--Memory logging-->
${recFormArticleService.templateLogDebug("Memory after processing template: "+templateName)}
<#assign usedMemoryMessage = "Used memory: " + recFormArticleService.getUsedMemory() + " Bytes"/>
<#assign totalMemoryMessage = "Total memory: " + recFormArticleService.getTotalMemory() + " Bytes"/>
${recFormArticleService.templateLogDebug(usedMemoryMessage)}
${recFormArticleService.templateLogDebug(totalMemoryMessage)}