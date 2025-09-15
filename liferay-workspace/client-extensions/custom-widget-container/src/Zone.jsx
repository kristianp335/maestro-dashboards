import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ClayIcon from '@clayui/icon';
import DropDown from '@clayui/drop-down';
import Button from '@clayui/button';

function Zone({ zoneId, widgetId, availableWidgets, handleWidgetSelection, handleRemoveWidget, moveWidget, widgetLabel }) {
    
    const canDrag = widgetId !== null;

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'WIDGET',
        item: { zoneId, widgetId },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag,
    }), [widgetId]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'WIDGET',
        drop: (item) => {
            if (item.zoneId !== zoneId) {
                moveWidget(item.zoneId, zoneId);
                item.zoneId = zoneId;
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        })
    }), [widgetId]);

    return (
        <div
            ref={(node) => drag(drop(node))}
            className="zone"
            style={{
                opacity: isDragging ? 0.5 : 1,
                border: widgetId === null ? '2px dashed #ccc' : 'none',
                padding: widgetId === null ? '10px' : '0',
                backgroundColor: widgetId === null ? '#f9f9f9' : 'transparent',
                boxShadow: isOver ? '0 0 10px 4px rgba(0, 123, 255, 0.6)' : '',
            }}
        >
            {widgetId === null ? (
                <div 
                    style={{height: "100px"}}
                    className="d-flex justify-content-center align-items-center"
                >
                    {isOver ? (
                        <span>Drop here</span>
                    ) : (
                        <DropDown
                            closeOnClick={true}
                            filterKey="name"
                            trigger={<Button>Select a Widget</Button>}
                            triggerIcon="caret-bottom"
                        >
                            <DropDown.Search placeholder="Type to filter" />
                            <DropDown.ItemList items={availableWidgets}>
                                {(widget) => (
                                    <DropDown.Item
                                        key={widget.widgetId}
                                        onClick={() => {
                                            handleWidgetSelection(zoneId, widget.widgetId);
                                        }}
                                    >
                                        {widget.label}
                                    </DropDown.Item>
                                )}
                            </DropDown.ItemList>
                        </DropDown>
                    )}
                </div>
            ) : (
                <div>
                    <div
                        className="d-flex justify-content-between align-items-center"
                        style={{
                            paddingLeft: '5px',
                            backgroundColor: '#e0e0e0',
                        }}
                    >
                        <div
                            ref={drag}
                            className="drag-handle flex-grow-1"
                            style={{
                                cursor: 'grab',
                            }}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="currentColor" 
                                style={{ marginRight: '8px', marginBottom: '5px' }}
                                aria-label="Drag handle"
                            >
                                <circle cx="4" cy="4" r="1.5"/>
                                <circle cx="4" cy="8" r="1.5"/>
                                <circle cx="4" cy="12" r="1.5"/>
                                <circle cx="8" cy="4" r="1.5"/>
                                <circle cx="8" cy="8" r="1.5"/>
                                <circle cx="8" cy="12" r="1.5"/>
                            </svg>
                            <h4 className="d-inline-block" style={{ marginTop: '10px' }}>{widgetLabel}</h4>
                        </div>            

                        <Button
                            displayType="primary"
                            onClick={() => handleRemoveWidget(widgetId)}
                        >
                            <svg 
                                width="16" 
                                height="16" 
                                viewBox="0 0 16 16" 
                                fill="currentColor"
                                aria-label="Delete widget"
                            >
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </Button>
                    </div>
                    <slot key={widgetId} name={widgetId} />
                </div>
            )}
        </div>
    );
}

export default Zone;