import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Zone from './Zone';
import { Provider } from '@clayui/core';
import '@clayui/css/lib/css/atlas.css';
import Button from '@clayui/button';

function CustomWidgetContainer({ availableWidgets, numberOfWidgets }) {

    const initialAssignments = {};
    for (let i = 1; i <= numberOfWidgets; i++) {
        initialAssignments[`zone-${i}`] = null;
    }

    const [plid, setPlid] = useState(null);
    const [widgetAssignments, setWidgetAssignments] = useState(initialAssignments);

    const fetchWidgetAssignments = async () => {

        if(plid !== null) {

            const userId = window.Liferay.ThemeDisplay.getUserId();
            const groupId = window.Liferay.ThemeDisplay.getSiteGroupId();

            const url = `/o/c/pagewidgetconfigurations/scopes/${groupId}`;

            const filter = `plid eq ${plid} and creatorId eq ${userId}`;

            const fields = 'configuration';

            try {
                const response = await window.Liferay.Util.fetch(`${url}?fields=${fields}&filter=${encodeURIComponent(filter)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (response.ok) {
                    const responseData = await response.json();

                    if (responseData.items && responseData.items.length > 0) {
                        const updatedAssignments = JSON.parse(responseData.items[0].configuration);

                        setWidgetAssignments(updatedAssignments);
                    }
                } else {
                    console.error('Failed to fetch widget assignments:', response.status);
                }
            } catch (error) {
                console.error('Error fetching widget assignments:', error);
            }

        }

    };

    useEffect(() => {
        fetchWidgetAssignments();
    }, [plid]); 

    useEffect(() => {

        function handleInit() {
            const newPlid = Liferay.ThemeDisplay.getPlid();
            setPlid(newPlid);
        }

        if(Liferay.ThemeDisplay.getLayoutRelativeURL() === document.location.pathname) {

            handleInit();

        } else {

            Liferay.on('endNavigate', handleInit);
        
            return () => {
                Liferay.detach('endNavigate', handleInit);
            };

        }

    }, []);

    const moveWidget = async (fromZoneId, toZoneId) => {
        setWidgetAssignments((prevAssignments) => {
            const updatedAssignments = { ...prevAssignments };

            const sourceWidgetId = updatedAssignments[fromZoneId];
            const destinationWidgetId = updatedAssignments[toZoneId];

            updatedAssignments[fromZoneId] = destinationWidgetId;
            updatedAssignments[toZoneId] = sourceWidgetId;

            return updatedAssignments;
        });
    };

    const handleWidgetSelection = async (zoneId, widgetId) => {
        setWidgetAssignments((prevAssignments) => {
            const updatedAssignments = { ...prevAssignments };

            for (let zone in updatedAssignments) {
                if (updatedAssignments[zone] === widgetId) {
                    updatedAssignments[zone] = null;
                }
            }

            updatedAssignments[zoneId] = widgetId;

            return updatedAssignments;
        });
    };

    const handleRemoveWidget = async (widgetId) => {
        setWidgetAssignments((prevAssignments) => {
            const updatedAssignments = { ...prevAssignments };

            for (let zone in updatedAssignments) {
                if (updatedAssignments[zone] === widgetId) {
                    updatedAssignments[zone] = null;
                }
            }

            return updatedAssignments;
        });
    };

    const handleSaveAssignments = async () => {
        const userId = window.Liferay.ThemeDisplay.getUserId();
        const scopeGroupId = window.Liferay.ThemeDisplay.getSiteGroupId();
        const plid = window.Liferay.ThemeDisplay.getPlid();

        const filter = `plid eq ${plid} and creatorId eq ${userId}`;
        const url = `/o/c/pagewidgetconfigurations/scopes/${scopeGroupId}?filter=${encodeURIComponent(filter)}`;
        
        const response = await Liferay.Util.fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const responseData = await response.json();

            if (responseData.items) {
                for (const item of responseData.items) {
                    await Liferay.Util.fetch(`/o/c/pagewidgetconfigurations/${item.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                        },
                    });
                }
            }

            console.log(widgetAssignments)

            await Liferay.Util.fetch(`/o/c/pagewidgetconfigurations/scopes/${scopeGroupId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    plid: plid,
                    configuration: JSON.stringify(widgetAssignments)
                }),
            });

            console.log('Widget assignments saved successfully');
        } else {
            console.error('Failed to fetch existing widget assignments:', response.status);
        }
    };

    const getWidgetLabel = (widgetId) => {
        const widget = availableWidgets.find(widget => widget.widgetId === widgetId);
        return widget ? widget.label : 'No label';
    };

    const getWidgetConfigurationId = (widgetId) => {
        const widget = availableWidgets.find(widget => widget.widgetId === widgetId);
        return widget ? widget.id : null;
    };

    return (
        <Provider spritemap={window.Liferay.Icons.spritemap}>
            <DndProvider backend={HTML5Backend}>
                <div className="container">
                    <div className="row">
                        {Object.keys(widgetAssignments).map((zoneId) => (
                            <div key={zoneId} className="col-sm-6 mb-4">
                                <Zone
                                    zoneId={zoneId}
                                    widgetId={widgetAssignments[zoneId]}
                                    availableWidgets={availableWidgets}
                                    handleWidgetSelection={handleWidgetSelection}
                                    handleRemoveWidget={handleRemoveWidget}
                                    moveWidget={moveWidget}
                                    widgetAssignments={widgetAssignments}
                                    widgetLabel={getWidgetLabel(widgetAssignments[zoneId])}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </DndProvider>
            <Button onClick={handleSaveAssignments} displayType="primary">
                Save Widget Assignments
            </Button>
        </Provider>
    );
}

export default CustomWidgetContainer;
