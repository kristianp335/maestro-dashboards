<#--COMMITTEE-ACTION-LOG-widgetTemplate-->

<#--Template use info logging-->
<#assign recFormArticleService = serviceLocator.findService("com.everis.cproposal.service.recFormArticleLocalService") />
<#assign templateName = "COMMITTEE-ACTION-LOG-widgetTemplate" />
<#assign logMessage = "Template: " + templateName + " (in " + themeDisplay.getURLCurrent() + ")" + " / User: " + themeDisplay.getUser().getFullName() + " (id=" + themeDisplay.getUser().getUserId() + ", " + themeDisplay.getUser().getEmailAddress() + ")" />
${recFormArticleService.templateLogDebug(logMessage)}

<#--Memory logging-->
${recFormArticleService.templateLogDebug("Memory before processing template: "+templateName)}
<#assign usedMemoryMessage = "Used memory: " + recFormArticleService.getUsedMemory() + " Bytes"/>
<#assign totalMemoryMessage = "Total memory: " + recFormArticleService.getTotalMemory() + " Bytes"/>
${recFormArticleService.templateLogDebug(usedMemoryMessage)}
${recFormArticleService.templateLogDebug(totalMemoryMessage)}

<#--<#assign recFormArticleService = serviceLocator.findService("com.everis.cproposal.service.recFormArticleLocalService") />-->
<#assign journalArticleService = serviceLocator.findService("com.liferay.journal.service.JournalArticleLocalService") />

<#assign userService = utilLocator.findUtil("com.liferay.portal.kernel.service.UserLocalService") />							
<#assign rolService = utilLocator.findUtil("com.liferay.portal.kernel.service.RoleLocalService") />							
<#assign RoleServiceUtil = utilLocator.findUtil("com.liferay.portal.kernel.service.UserGroupRoleLocalService") />

<#assign userId = themeDisplay.getUserId() />
<#assign groupId = themeDisplay.getScopeGroupId() />
<#assign user = userService.getUser(userId)>							
<#assign userRoles = user.getRoles() />
<#assign siteRoles = RoleServiceUtil.getUserGroupRoles(userId, groupId) />
<#assign userEmail = user.getEmailAddress() />

<#-- member -->
<#assign member = false />
<#assign users = userService.getGroupUserIds(groupId)/>
<#list users as user>
    <#if user == userId >
        <#assign member = true />
    </#if>
</#list>

<#assign images_folder = themeDisplay.getPathThemeImages() />
<#assign memberCommittee = 0 />
<#assign isAdmin = 0 />

<#list userRoles as rol>
	<#if rol.getName() == "Administrator" || rol.getName() == "Committee_Secretariat_Admi">		
		<#assign isAdmin = 1 />							
	</#if>							
</#list>

<#assign ddmStructureService = serviceLocator.findService("com.liferay.dynamic.data.mapping.service.DDMStructureLocalService") />
<#assign listddmStructure =  ddmStructureService.getDDMStructures(0, ddmStructureService.getDDMStructuresCount()) />

<#list listddmStructure as ddm>
	<#if ddm.getNameCurrentValue() == "COMMITTEE-ACTION-LOG" && ddm.getGroupId() == groupId>
		<#assign structureKey = ddm.getStructureKey() />
	</#if>
</#list>

<#assign hasCustomFilter = false />

<#assign filterList = "" />
<#assign filterStartDate = "" />
<#assign filterEndDate = "" />
<#assign filterStatus = "" />
<#assign filterStartUpdate = "" />
<#assign filterEndUpdate = "" />

<#-- FILTER BLOCKS -->
<#if request.getParameter("filterStartDate")??>
	<#assign hasCustomFilter = true />
	<#assign filterStartDate = request.getParameter("filterStartDate") + " 00:00:00" />
	<#assign filterList = filterList + ",filterStartDate:" + request.getParameter("filterStartDate") />
</#if>

<#if request.getParameter("filterEndDate")??>
	<#assign hasCustomFilter = true />
	<#assign filterEndDate = request.getParameter("filterEndDate")  + " 23:59:59" />
	<#assign filterList = filterList + ",filterEndDate:" + request.getParameter("filterEndDate") />
</#if>

<#if request.getParameter("filterStatus")??>
	<#assign hasCustomFilter = true />
	<#assign filterStatus = request.getParameter("filterStatus") />
	<#assign filterList = filterList + ",filterStatus:" + request.getParameter("filterStatus") />
</#if>

<#if request.getParameter("filterStartUpdate")??>
	<#assign hasCustomFilter = true />
	<#assign filterStartUpdate = request.getParameter("filterStartUpdate") + " 00:00:00" />
	<#assign filterList = filterList + ",filterStartUpdate:" + request.getParameter("filterStartUpdate") />
</#if>

<#if request.getParameter("filterEndUpdate")??>
	<#assign hasCustomFilter = true />
	<#assign filterEndUpdate = request.getParameter("filterEndUpdate")  + " 23:59:59" />
	<#assign filterList = filterList + ",filterEndUpdate:" + request.getParameter("filterEndUpdate") />
</#if>

<#assign filterList = filterList?remove_beginning(",") />
<#-- END FILTER BLOCKS --> 

<#assign filterImg = themeDisplay.getPathThemeImages()+"/forms/filter.svg" />
<#assign chevromImg = themeDisplay.getPathThemeImages()+"/forms/chevrom.svg" />

<#assign siteName = themeDisplay.getSiteGroupName() />
<#assign siteName = siteName?replace(" ", "-") />
<#assign siteName = siteName?lower_case />

<#assign ddmStructureService = serviceLocator.findService("com.liferay.dynamic.data.mapping.service.DDMStructureLocalService") />
<#assign listddmStructure =  ddmStructureService.getDDMStructures(0, ddmStructureService.getDDMStructuresCount()) />

<#assign urlLocal = "/group/guest/~/control_panel/manage?p_p_id=com_liferay_journal_web_portlet_JournalPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_journal_web_portlet_JournalPortlet_mvcPath=%2Fedit_article.jsp&_com_liferay_journal_web_portlet_JournalPortlet_redirect=%2Fgroup%2Fguest%2F~%2Fcontrol_panel%2Fmanage%3Fp_p_id%3Dcom_liferay_journal_web_portlet_JournalPortlet%26p_p_lifecycle%3D0%26p_p_state%3Dmaximized%26p_p_mode%3Dview%26p_p_auth%3DsZAlU3zq&_com_liferay_journal_web_portlet_JournalPortlet_groupId=20121&_com_liferay_journal_web_portlet_JournalPortlet_folderId=0&_com_liferay_journal_web_portlet_JournalPortlet_ddmStructureKey=37846&p_p_auth=zsdu4GaS" />
<#assign url = "/group/"+siteName+"/action-log-form" />

<#assign ddmStructureService = serviceLocator.findService("com.liferay.dynamic.data.mapping.service.DDMStructureLocalService") />
<#assign listddmStructure =  ddmStructureService.getDDMStructures(0, ddmStructureService.getDDMStructuresCount()) />

<#list listddmStructure as ddm>
    <#if ddm.getNameCurrentValue() == "COMMITTEE-ACTION LOG" && ddm.getGroupId() == groupId>
        <#assign structureKey = ddm.getStructureKey() />
    </#if>
</#list>
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
								<span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]}', '${statusItem}')">&times;</a> ${statusItem} </span>
							</#list>
						<#else>
							<#if filter?contains("filterStartDate") || filter?contains("filterEndDate") || filter?contains("filterStartUpdate") || filter?contains("filterEndUpdate")>
								<span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]}', '${filter?split(":")[1]}')">&times;</a> ${filter?split(":")[1]} </span>
							<#else>
								<span class="status filterAdded"> <a class="close" onclick="removeFilter('${filter?split(":")[0]}', '${filter?split(":")[1]}')">&times;</a> ${filter?split(":")[1]} </span>
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
						<a id="newAction" href="${url}">Make an action</a>
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

                    <#if (!filterStartDate?has_content || !filterEndDate?has_content) && (!filterStartUpdate?has_content || !filterEndUpdate?has_content)>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, null, null, groupId, structureKey) />
						<#elseif !filterStartUpdate?has_content || !filterEndUpdate?has_content>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, null, null, groupId, structureKey) />
						<#elseif !filterStartDate?has_content || !filterEndDate?has_content>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
						<#else>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
						</#if>

                    <#if filteredJA?has_content>
                        <#assign finalList = filteredJA />

                        <#list finalList as ja> <#-- <#list filteredJA as ja>  -->

                            <#assign document = saxReaderUtil.read(ja.getContent())/>
							<#assign articleResourcePK = ja.getResourcePrimKey() />

                            <#assign urlTitle = ja.getUrlTitle() />
                            <#assign assetURL = "/group/guest/-/" + urlTitle />

                            <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                            <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                            <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                            <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                            <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                            <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                            <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

							<#assign lastJournalArticle = journalArticleService.fetchLatestArticle(articleResourcePK) />
							<#assign lastJournalArticleVersion =lastJournalArticle.getVersion() />

                            <#-- <#assign editUrl = "/group/"+siteName+"/~/control_panel/manage?p_p_id=com_liferay_journal_web_portlet_JournalPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_journal_web_portlet_JournalPortlet_mvcPath=%2Fedit_article.jsp&_com_liferay_journal_web_portlet_JournalPortlet_redirect=%2Fgroup%2F"+siteName+"/action-log&_com_liferay_journal_web_portlet_JournalPortlet_groupId="+groupId+"&_com_liferay_journal_web_portlet_JournalPortlet_folderId=0&_com_liferay_journal_web_portlet_JournalPortlet_articleId="+articleId+"&_com_liferay_journal_web_portlet_JournalPortlet_version=1.0&p_p_auth=1a9RI7GP" /> -->
                            <#assign editUrl = "/group/"+siteName+"/action-log-form/?mode=EDIT&actionLogId="+articleResourcePK/>
                            <#if status == "Open" && lastJournalArticleVersion == ja.version>        
                                <tr> 
                                    <td class="left-align-text"></td>
                                        
                                    <#-- ID -->
                                    <td class="left-align-text">${id}</td>
                                    <#-- Description -->
                                    <td class="left-align-text tdEllipsis"><p class="ellipsis">${descp}</p></td>
                                    <#-- Assignee(s) -->
                                    <td class="left-align-text">${assine}</td>
                                    <#-- Due Date -->
                                    <td class="left-align-text">${due}</td>
                                    <#-- NextUpdateDue -->
                                    <td class="left-align-text">${nex}</td>
                                    <#-- Status -->
                                    <td class="left-align-text">${status}</td>
                                    <#-- Completion Date -->
                                    <td class="left-align-text">${comple}</td>

                                    <#if isAdmin == 1 >
                                        <td><a href="${editUrl}"><img class="img" src="${chevromImg}"></a></td>
                                    <#elseif (userEmail?string == assine)>
                                        <td><a onclick="openForm(${articleResourcePK})"><img class="img" src="${chevromImg}"></a></td>
                                    </#if>
                                </tr>
                            </#if>
                        </#list>
                    </#if>
		        <#else>
                    <#if entries?has_content>
                        <#list entries as curEntry>
                            <#assign renderer = curEntry.getAssetRenderer() />
                            <#assign className = renderer.getClassName() />

                            <#if className == "com.liferay.journal.model.JournalArticle">
                                <#assign journalArticle = renderer.getArticle() />
                                <#assign document = saxReaderUtil.read(journalArticle.getContent())/>
                                <#assign articleId = journalArticle.getArticleId() /> 
                                <#assign articleResourcePK = journalArticle.getResourcePrimKey() />
                                <#-- <#assign editUrl = "/group/"+siteName+"/~/control_panel/manage?p_p_id=com_liferay_journal_web_portlet_JournalPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_journal_web_portlet_JournalPortlet_mvcPath=%2Fedit_article.jsp&_com_liferay_journal_web_portlet_JournalPortlet_redirect=%2Fgroup%2F"+siteName+"/action-log&_com_liferay_journal_web_portlet_JournalPortlet_groupId="+groupId+"&_com_liferay_journal_web_portlet_JournalPortlet_folderId=0&_com_liferay_journal_web_portlet_JournalPortlet_articleId="+articleId+"&_com_liferay_journal_web_portlet_JournalPortlet_version=1.0&p_p_auth=1a9RI7GP" /> -->
                                <#assign editUrl = "/group/"+siteName+"/action-log-form/?mode=EDIT&actionLogId="+articleResourcePK/>

                                <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />

                                <#assign creteDate = journalArticle.getCreateDate()?date />
                                <#assign pmURL = "/group/guest/-/" + journalArticle.getUrlTitle() />

                            </#if>

                            <#if status == "Open">

                                <tr> 
                                    <td class="left-align-text"></td>

                                    <#-- ID -->
                                    <td class="left-align-text">${id}</td>
                                    <#-- Description -->
                                    <td class="left-align-text tdEllipsis"><p class="ellipsis">${descp}</p></td>
                                    <#-- Assignee(s) -->
                                    <td class="left-align-text">${assine}</td>
                                    <#-- Due Date -->
                                    <td class="left-align-text">${due}</td>
                                    <#-- NextUpdateDue -->
                                    <td class="left-align-text">${nex}</td>
                                    <#-- Status -->
                                    <td class="left-align-text">${status}</td>
                                    <#-- Completion Date -->
                                    <td class="left-align-text">${comple}</td>

                                    <#if isAdmin == 1 >
                                        <td><a href="${editUrl}"><img class="img" src="${chevromImg}"></a></td>
                                    <#elseif (userEmail?string == assine)>
                                        <td><a onclick="openForm(${articleResourcePK})"><img class="img" src="${chevromImg}"></a></td>
                                    </#if>
                                </tr>
                            </#if>
                        </#list>
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
				    <#-- CUSTOM FILTER (DATE/STATUS) -->
			        <#if hasCustomFilter>

	                    <#if (!filterStartDate?has_content || !filterEndDate?has_content) && (!filterStartUpdate?has_content || !filterEndUpdate?has_content)>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, null, null, groupId, structureKey) />
						<#elseif !filterStartUpdate?has_content || !filterEndUpdate?has_content>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, null, null, groupId, structureKey) />
						<#elseif !filterStartDate?has_content || !filterEndDate?has_content>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(null, null, filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndUpdate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
						<#else>
							<#assign filteredJA = recFormArticleService.getActionLogFiltered(filterStartDate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), filterStatus, filterStartUpdate?datetime("yyyy-MM-dd HH:mm:ss"), filterEndDate?datetime("yyyy-MM-dd HH:mm:ss"), groupId, structureKey) />
						</#if>

                        <#if filteredJA?has_content>

                            <#assign finalList = filteredJA />
                            <#list finalList as ja> <#-- <#list filteredJA as ja>  -->
								
                                <#assign document = saxReaderUtil.read(ja.getContent())/>								
								<#assign articleResourcePK = ja.getResourcePrimKey() />

                                <#assign urlTitle = ja.getUrlTitle() />
                                <#assign assetURL = "/group/guest/-/" + urlTitle />

                                <#assign id = document.valueOf("//dynamic-element[@name='ActionLog_ID']/dynamic-content/text()") />
                                <#assign descp = document.valueOf("//dynamic-element[@name='ActionLog_Description']/dynamic-content/text()") />
                                <#assign assine = document.valueOf("//dynamic-element[@name='ActionLog_AssigneeEmail']/dynamic-content/text()") />
                                <#assign due = document.valueOf("//dynamic-element[@name='ActionLog_DueDate']/dynamic-content/text()") />
                                <#assign nex = document.valueOf("//dynamic-element[@name='ActionLog_NextUpdateDue']/dynamic-content/text()") />
                                <#assign status = document.valueOf("//dynamic-element[@name='ActionLog_Status']/dynamic-content/text()") />
                                <#assign comple = document.valueOf("//dynamic-element[@name='ActionLog_CompletionDate']/dynamic-content/text()") />
								
								<#assign lastJournalArticle = journalArticleService.fetchLatestArticle(articleResourcePK) />
								<#assign lastJournalArticleVersion =lastJournalArticle.getVersion() />				

                                <#-- <#assign editUrl = "/group/"+siteName+"/~/control_panel/manage?p_p_id=com_liferay_journal_web_portlet_JournalPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_journal_web_portlet_JournalPortlet_mvcPath=%2Fedit_article.jsp&_com_liferay_journal_web_portlet_JournalPortlet_redirect=%2Fgroup%2F"+siteName+"/action-log&_com_liferay_journal_web_portlet_JournalPortlet_groupId="+groupId+"&_com_liferay_journal_web_portlet_JournalPortlet_folderId=0&_com_liferay_journal_web_portlet_JournalPortlet_articleId="+articleId+"&_com_liferay_journal_web_portlet_JournalPortlet_version=1.0&p_p_auth=1a9RI7GP" /> -->
                                <#assign editUrl = "/group/"+siteName+"/action-log-form/?mode=EDIT&actionLogId="+articleResourcePK/>

                                <#if status != "Open" && lastJournalArticleVersion == ja.version>        
                                    <tr> 
                                        <td class="left-align-text"></td>

                                        <#-- ID -->
                                        <td class="left-align-text">${id}</td>
                                        <#-- Description -->
                                        <td class="left-align-text tdEllipsis"><p class="ellipsis">${descp}</p></td>
                                        <#-- Assignee(s) -->
                                        <td class="left-align-text">${assine}</td>
                                        <#-- Due Date -->
                                        <td class="left-align-text">${due}</td>
                                        <#-- NextUpdateDue -->
                                        <td class="left-align-text">${nex}</td>
                                        <#-- Status -->
                                        <td class="left-align-text">${status}</td>
                                        <#-- Completion Date -->
                                        <td class="left-align-text">${comple}</td>

                                        <#if isAdmin == 1 >
                                            <td><a href="${editUrl}"><img class="img" src="${chevromImg}"></a></td>
                                        <#elseif (userEmail?string == assine)>
                                            <td><a onclick="openForm(${articleResourcePK})"><img class="img" src="${chevromImg}"></a></td>
                                        </#if>
                                    </tr>
                                </#if>
                            </#list>
                        </#if>
                    <#else>
                        <#if entries?has_content>
                            <#list entries as curEntry>
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

                                    <#-- <#assign editUrl = "/group/"+siteName+"/~/control_panel/manage?p_p_id=com_liferay_journal_web_portlet_JournalPortlet&p_p_lifecycle=0&p_p_state=maximized&p_p_mode=view&_com_liferay_journal_web_portlet_JournalPortlet_mvcPath=%2Fedit_article.jsp&_com_liferay_journal_web_portlet_JournalPortlet_redirect=%2Fgroup%2F"+siteName+"/action-log&_com_liferay_journal_web_portlet_JournalPortlet_groupId="+groupId+"&_com_liferay_journal_web_portlet_JournalPortlet_folderId=0&_com_liferay_journal_web_portlet_JournalPortlet_articleId="+articleId+"&_com_liferay_journal_web_portlet_JournalPortlet_version=1.0&p_p_auth=1a9RI7GP" /> -->
                                    <#assign editUrl = "/group/"+siteName+"/action-log-form/?mode=EDIT&actionLogId="+articleResourcePK/>
                                </#if>

                                <#if status != "Open">        
                                    <tr> 
                                        <td class="left-align-text"></td>

                                        <#-- ID -->
                                        <td class="left-align-text">${id}</td>
                                        <#-- Description -->
                                        <td class="left-align-text tdEllipsis"><p class="ellipsis">${descp}</p></td>
                                        <#-- Assignee(s) -->
                                        <td class="left-align-text">${assine}</td>
                                        <#-- Due Date -->
                                        <td class="left-align-text">${due}</td>
                                        <#-- NextUpdateDue -->
                                        <td class="left-align-text">${nex}</td>
                                        <#-- Status -->
                                        <td class="left-align-text">${status}</td>
                                        <#-- Completion Date -->
                                        <td class="left-align-text">${comple}</td>

                                        <#if isAdmin == 1 >
                                            <td><a href="${editUrl}"><img class="img" src="${chevromImg}"></a></td>
                                        <#elseif (userEmail?string == assine)>
                                            <td><a onclick="openForm(${articleResourcePK})"><img class="img" src="${chevromImg}"></a></td>
                                        </#if>
                                    </tr>
                                </#if>
                            </#list>
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

<#-- EXECUTION DE FILTROS -->
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
		var currentURL = new URL(location.protocol + '//' + location.host + location.pathname);
		var emptyChecks = true;

		//START filterDate
		var startDate = $(".filterImplementation .leftSide #dateFrom input[type=date]").val();
		console.log("startDate " + startDate);
		var endDate = $(".filterImplementation .rigthSide #dateTo input[type=date]").val();
		console.log("endDate " + endDate);

		if (startDate && endDate) {
			currentURL.searchParams.append('filterStartDate', startDate);
			currentURL.searchParams.append('filterEndDate', endDate);
			emptyChecks = false;
		}
		//END filterDate

		//START filterStatus
		var status = "";
		$(".filterStatus").find("input[type=checkbox]").each(function(){
			if ($(this).prop('checked')==true){ 
				status = status + ";spt;" + $(this).attr("data-status");
					console.log("Status1: " + status);
			}
		});

		if(status != ""){
			status = status.substring(5);
			currentURL.searchParams.append('filterStatus', status);
			emptyChecks = false;
				console.log("Status2: " + status);
		}
		//END filterStatus

        //START filterUpdate
		var startUpdate = $(".filterImplementationUpdate .leftSide #updateFrom input[type=date]").val();
		console.log("startUpdate " + startUpdate);
		var endUpdate = $(".filterImplementationUpdate .rigthSide #updateTo input[type=date]").val();
		console.log("endUpdate " + endUpdate);

		if (startUpdate && endUpdate) {
			currentURL.searchParams.append('filterStartUpdate', startUpdate);
			currentURL.searchParams.append('filterEndUpdate', endUpdate);
			emptyChecks = false;
		}
		//END filterUpdate

		console.log("currentURL " + currentURL);
		if(emptyChecks){
			currentURL = window.location.pathname;
		}
		currentURL.searchParams.append('page', 0);
		window.location.replace(currentURL);
	}

    function removeFilters(){
        var currentURL = new URL(window.location.href);

        if(currentURL.searchParams.get('filterStartDate') != null){
            currentURL.searchParams.delete('filterStartDate');
        } 
        if(currentURL.searchParams.get('filterEndDate') != null){
            currentURL.searchParams.delete('filterEndDate');
        } 
        if(currentURL.searchParams.get('filterStatus') != null){
            currentURL.searchParams.delete('filterStatus');
        }
        if(currentURL.searchParams.get('filterStartUpdate') != null){
            currentURL.searchParams.delete('filterStartUpdate');
        } 
        if(currentURL.searchParams.get('filterEndUpdate') != null){
            currentURL.searchParams.delete('filterEndUpdate');
        }
        if(currentURL.searchParams.get('page') != null){
            currentURL.searchParams.delete('page');
        } 

        window.location.replace(currentURL);
    }

	function clearFilters() {

		$('input[type=checkbox]').prop('checked',false);

	}


    function removeFilter(filter, value){
			var currentURL = new URL(window.location.href);
			if(filter === "filterStatus" ){
				var filters = currentURL.searchParams.get(filter);
				if(filters.includes(";spt;")){
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
				console.log(filter);
				if (filter.includes("filterStartDate") || filter.includes("filterEndDate") || filter.includes("filterStartUpdate") || filter.includes("filterEndUpdate")) {
					currentURL.searchParams.delete("filterStartDate");
					currentURL.searchParams.delete("filterEndDate");
                    currentURL.searchParams.delete("filterStartUpdate");
					currentURL.searchParams.delete("filterEndUpdate");
					currentURL.searchParams.delete('page');
					currentURL.searchParams.append('page', 0);
				}
				else {
					currentURL.searchParams.delete(filter);
					currentURL.searchParams.delete('page');
				}
			}

			window.location.href = currentURL;
		}


</script>

<#-- POP-PUP USER CHANGE STATUS -->
<script> 

	function openForm(articleResourcePK){
		var pop = document.getElementById("actionStatus");
		pop.style.display = "block"; 
		pop.style.opacity = "1";
		pop.style.visibility = "visible";

		$("#updateButton").click(function(){
			var newStatus = $("#selectStatus").val(); 

			Liferay.Service('/cproposal.recformarticle/update-impact-tab-journal-article', 
			{
				fieldNameIMP: 'ActionLog_Status',
				newTextIMP: newStatus,
				groupId: ${groupId}, 
				resourcePrimKey: articleResourcePK
			},
			function(obj) {
	console.log(obj);
	});
	setTimeout(function(){
		window.location.reload(1);
		}, 1000);
		});
		}

			function closeForm() { 
				var pop = document.getElementById("actionStatus");
				pop.style.display = "none"; 
				} 

</script>

<#-- STYLES -->
<style>
	#newAction {
		float: right;
			font-weight: normal;
	}

	#committeeContent {
		clear: both;
		margin-top: 20px;
	}

	tr{
		border-bottom: solid 3px #ececec;
	}

	th{
		color: #9b9b9b;
		font-size: 12px;
		font-weight: normal;
		height: 18px;
		letter-spacing: .25px;
		line-height: 18px;
	}

	#committeeTableList, #committeeTableListClosed{
		border-style: none;
		border-collapse: collapse;
		width: 98%;
		margin-left: 1%;
	}

	#committeeContent, #committeeContentClosed{
		background-color: white;
		border-radius: 4px;
		box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.3);
		margin-top: 1%;
		padding-top: 1%;
	}

	#newAction, #newActionClosed{
		background: #b1c568;
		padding: 10px;
		border-radius: 3px;
		color: white;
		width: fit-content;
		margin-bottom: 0;
		font-size: 12px;
		border: 0;
		margin-right: 12px;
	}

	#committeeTitleClosed{
		padding-top: 30px;
	}

		#actionStatus {
			display: none;
		}

		.popupSolutions {
			width: 204px !important;
		}

		.filters{
		color: rgb(0, 0, 0);
		font-family: Roboto-Regular;
		font-size: 16px;
		font-weight: normal;
		margin-bottom: 30px;
		letter-spacing: 0.5px;
		line-height: 30px;
		margin-top: -15px; /*Update padding-top: 2%; in #table-impact, then delete it style*/ 
        }

		.filterOpt{
			float: right;
		}

		img#filterImg{
			width: 20px;
			height: 18px;
		}

		.filterList{
			padding-left: 3%;
			font-weight: bold;
		}

		.filterList a{
			color:black;
		}

		.filterList a:hover {
			color: black;
			text-decoration: underline;
		}

		.filterList .close{
			color:white;
			width: 15px;
			height: 15px;
        float: none;
            }

        .filterList .close:hover{
            color:white;
            }

		span.status.filterAdded {
			margin-right: 2px;
		}

		.filterAdded{
		background:black;
		color:white;
		border-radius: 3px;
		}

		/* pop up filter style */
		.popup1 {
			visibility: hidden;
			position: fixed;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			background: rgba(0, 0, 0, 0.7);
			transition: opacity 500ms;
			overflow: auto;
			z-index: 999;
		}
		.popupFilter div {
			padding: 3px;
		}

		.popupFilter {
			background: rgb(255, 255, 255);
			border-radius: 4px;
			box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.3);
			height: auto;
			width: 750px;
			margin: 70px auto;
			position: relative;
			padding: 1.5%;
		}

		.popupFilter .close {
			position: absolute;
			top: 0px;
			right: 0px;
			border-radius: 0px;
			height: 53.13px;
			width: 53.13px;
		}


		.popupFilter #dateFrom, .popupFilter #dateTo {
			text-align: center;
		}

		.popupFilter h1 {
			color: rgb(0, 0, 0);
			font-family: Roboto-Regular;
			font-size: 20px;
			font-weight: normal;
			height: 30px;
			letter-spacing: 0.75px;
			line-height: 30px;
		}

		.popupFilter h3 {
			color: #9b9b9b;
			font-family: Roboto-Regular;
			font-size: 12px;
			font-weight: normal;
			height: 18px;
			letter-spacing: 0.25px;
			line-height: 18px;
			padding-top: 5px;
		}

		.rigthSide {
			width: 45%;
			float: right;
		}


		.leftSide {
			width: 45%;
			float: left;
		}

		.full-row {
			width: 100%;
		}

		.full-row .btnDropDown {
			width: 100%;
		}

		.full-row .filterImpacted {
			width: 99%;
			max-height: 205px !important;
		}

		.filterCategory {
		max-height: 100px !important;
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
			width: 217px;;
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

</style>
</#if>

<#--Memory logging-->
${recFormArticleService.templateLogDebug("Memory after processing template: "+templateName)}
<#assign usedMemoryMessage = "Used memory: " + recFormArticleService.getUsedMemory() + " Bytes"/>
<#assign totalMemoryMessage = "Total memory: " + recFormArticleService.getTotalMemory() + " Bytes"/>
${recFormArticleService.templateLogDebug(usedMemoryMessage)}
${recFormArticleService.templateLogDebug(totalMemoryMessage)}