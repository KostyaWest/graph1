import React, { useState } from 'react';

const EdgeConfigurator = ({ startNode, endNode, onEdgeCreate, onCancel }) => {
    const [edgeColor, setEdgeColor] = useState('black');
    const [edgeThickness, setEdgeThickness] = useState(2);
    const [label, setLabel] = useState('');
    
    const handleColorChange = (e) => setEdgeColor(e.target.value);
    const handleThicknessChange = (e) => setEdgeThickness(Number(e.target.value));
    const handleLabelChange = (e) => setLabel(e.target.value);

    const handleCreateEdge = () => {
        // Формируем новое ребро с учётом настроек
        const newEdge = {
            start: startNode,
            end: endNode,
            color: edgeColor,
            thickness: edgeThickness,
            label: label
        };
        onEdgeCreate(newEdge); // Создаём ребро
    };

    return (
        <div className="edge-configurator">
            <h3>Настройки рёбер</h3>
            <div>
                <label>Цвет рёбер:</label>
                <input type="color" value={edgeColor} onChange={handleColorChange} />
            </div>
            <div>
                <label>Толщина линии:</label>
                <input 
                    type="number" 
                    value={edgeThickness} 
                    min="1" 
                    max="10" 
                    onChange={handleThicknessChange} 
                />
            </div>
            <div>
                <label>Метка рёбер:</label>
                <input 
                    type="text" 
                    value={label} 
                    onChange={handleLabelChange} 
                    placeholder="Введите текст"
                />
            </div>
            <div>
                <button onClick={handleCreateEdge}>Создать ребро</button>
                <button onClick={onCancel}>Отменить</button>
            </div>
        </div>
    );
};

export default EdgeConfigurator;
