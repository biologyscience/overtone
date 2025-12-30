import { useState, cloneElement } from 'react';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useSortable, arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS as dndCSS } from '@dnd-kit/utilities';

function SortableItem({id, children})
{
    const { children: _, className, ...rest } = children.props;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({id});

    const actualChildren = [];

    function toArray(x) { return Array.isArray(x) ? x : [x]; }

    toArray(children.props.children).forEach((child, i) =>
    {
        let toPush = cloneElement(child, {key: i});

        if (child.props['data-is-drag-handle']) toPush = cloneElement(child, {key: i, ...listeners});

        actualChildren.push(toPush);
    });

    return (
        <div ref={setNodeRef} className={`${className} ${isDragging ? 'dragging' : ''}`} style={{transform: dndCSS.Transform.toString(transform)}} {...attributes} {...rest}>
            {actualChildren}
        </div>
    );
}

export default function SortableList({children})
{
    if (children === undefined) return;

    const [items, setItems] = useState(children);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    function handleDragEnd({active, over})
    {
        if (active.id === over.id) return;

        setItems((oldItems) =>
        {
            const ids = oldItems.map(x => x.props.id);

            const oldIndex = ids.indexOf(active.id);
            const newIndex = ids.indexOf(over.id);

            return arrayMove(oldItems, oldIndex, newIndex);
        });
    }
    
    return (
        <DndContext sensors={sensors} modifiers={[restrictToParentElement, restrictToVerticalAxis]} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(x => x.props.id)} strategy={verticalListSortingStrategy}>
                {items.map((item, i) => <SortableItem key={i} id={item.props.id}>{item}</SortableItem>)}
            </SortableContext>
        </DndContext>
    )
}