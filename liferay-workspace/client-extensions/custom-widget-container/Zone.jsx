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
                            <ClayIcon symbol="drag" />
                            <h4 class="d-inline-block">{widgetLabel}</h4>
                        </div>            

                        <Button
                            displayType="secondary"
                            onClick={() => handleRemoveWidget(widgetId)}
                        >
                            <ClayIcon symbol="trash" />
                        </Button>
                    </div>
                    <slot key={widgetId} name={widgetId} />
                </div>
            )}
        </div>
    );
}

export default Zone;