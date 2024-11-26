import React, { useState, useEffect, useRef } from 'react';
import './graph.css';
import './edgeconfig.css'

const App = () => {
    const [nodes, setNodes] = useState([]);
    const [addingNode, setAddingNode] = useState(false);
    const [lastNodeId, setLastNodeId] = useState(0);

    const [deletingNode, setDeletingNode] = useState(false);

    const [edges, setEdges] = useState([]);
    const [addingEdge, setAddingEdge] = useState(false);
    const [showEdgeEditor, setShowEdgeEditor] = useState(false); // Модальное окно для работы с ребрами
    const [edgeWeight, setEdgeWeight] = useState(""); //хранение веса. пустая строка
    const [isOkClicked, setIsOkClicked] = useState(false);//кликнули через ок или скипнули модальное окно
    const [selectedNode, setSelectedNode] = useState(null);  // Первый узел
    const [secondNode, setSecondNode] = useState(null);     // Второй узел

    const [message, setMessage] = useState("Нажмите на кнопку для дальнейших действий");
    const svgRef = useRef();

    // Функция для начала добавления ориентированного ребра
    const startAddingEdge = () => {
        setDeletingNode(false);
        setAddingNode(false);
        setAddingEdge(true);
        setMessage("Выберите два узла для создания ребра.");
    };

    // Функция для начала добавления узла
    const startAddingNode = () => {
        setDeletingNode(false);
        setAddingEdge(false);
        setAddingNode(true);
    };

    // Функция для добавления узла (при клике на рабочую поверхность)
    const addNode = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const radius = 20;
    
        if (x < radius || x > 800 - radius || y < radius || y > 600 - radius) {
            setMessage("Узел должен находиться внутри рабочей зоны.");
            return;
        }
    
        const isColliding = nodes.some(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            return Math.sqrt(dx * dx + dy * dy) < radius * 3;
        });
    
        if (isColliding) {
            setMessage("Узел не может быть добавлен здесь. Пожалуйста, выберите другое место.");
            return;
        }
    
        const newNode = { id: lastNodeId + 1, x: x - radius, y: y - radius };
        setNodes(prevNodes => [...prevNodes, newNode]);
    
        setLastNodeId(lastNodeId + 1);
    };

    // Функция для начала удаления узла
    const startDeletingNode = () => {
        setAddingNode(false);
        setAddingEdge(false);
        setDeletingNode(true);
        setMessage("Кликните на узел, чтобы удалить его");
    };

    const deleteNode = (nId) => {                    
        if (deletingNode) {
            setNodes(prevNodes => prevNodes.filter(n => n.id !== nId));
            setEdges(prevEdges => prevEdges.filter(edge => edge.start.id !== nId && edge.end.id !== nId));
            }   
        }
    

    const handleClick = (e) => {
        if (addingNode) {
            addNode(e); // Добавление нового узла
            setAddingNode(false); // Сброс флага
        }
    }  

    // Добавляем обработчик для клика по рабочей зоне
    const handleCanvasClick = (e) => {
        handleClick(e); // Вызов основной функции для обработки кликов
    };
    
    const handleNodeClick = (node) => {
        if (deletingNode) {
            deleteNode(node.id);
        }
        else if (addingEdge) {
            // Логируем состояние первого узла при клике в режиме "Соединить рёбер"
            if (!selectedNode) {
                setSelectedNode(node);
                setMessage("Теперь выберите второй узел.");
            } 
            else if (selectedNode && !secondNode) {
                setSecondNode(node);
                setShowEdgeEditor(true); // Показать модальное окно
                setMessage("Введите вес для рёбер.");
            } else {
                // Если оба узла уже выбраны, сбрасываем всё
                setSelectedNode(node);
                setSecondNode(null);
                setShowEdgeEditor(false);
                setMessage("Выберите первый узел.");
            }
        }
    };

    // Обработчик изменения веса ребра
    const handleWeightChange = (e) => {
        setEdgeWeight(e.target.value);
    };

    // Обработчик подтверждения создания ребра
    const handleOkClick = () => {
        if (selectedNode && secondNode) {
            // Создаем строку для идентификатора ребра, используя порядок узлов
            const edgeId1 = `${selectedNode.id}-${secondNode.id}`;
    
            // Проверяем, существует ли уже ребро в любом из направлений
            const edgeExists = edges.some(edge => 
                (edge.id === edgeId1) // Проверяем оба возможных идентификатора
            );
    
            if (edgeExists) {
                setMessage("Ребро между этими узлами уже существует.");
                setSelectedNode(null);
                setSecondNode(null);
                setShowEdgeEditor(false);
                setEdgeWeight("0"); // Сбросить вес
            }
    
            // Если ребро не существует, добавляем новое
            const newEdge = {
                id: edgeId1, // Можно использовать один идентификатор, так как они одинаковы по сути
                start: selectedNode,
                end: secondNode,
                weight: parseFloat(edgeWeight) || 0, // Преобразуем вес в число или устанавливаем 0, если вес не задан
            };
            
            setEdges(prevEdges => [...prevEdges, newEdge]); // Добавляем ребро в список рёбер
            setMessage("Ребро создано.");
        }
    
        // Сброс состояния узлов после нажатия ОК
        setSelectedNode(null);
        setSecondNode(null);
        setShowEdgeEditor(false);
        setEdgeWeight("0"); // Сбросить вес
    };

    const handleClose = () => {
        // Сбрасываем выбранные узлы
        setSelectedNode(null);
        setSecondNode(null);
        
        // Закрываем модальное окно и сбрасываем вес ребра
        setShowEdgeEditor(false);
        setEdgeWeight("0");
        setMessage("Ребро не создано.");
    };

    // Отображение графа
    const renderGraph = () => {
        return (
            <>
                {edges.map((edge) => (
                    <g key={edge.id}>
                        <line
                            x1={edge.start.x + 20}
                            y1={edge.start.y + 20}
                            x2={edge.end.x + 20}
                            y2={edge.end.y + 20}
                            stroke="black"
                            strokeWidth="2"
                        />
                        <text
                            x={(edge.start.x + edge.end.x) / 2 + 20}
                            y={(edge.start.y + edge.end.y) / 2 + 20}
                            fontSize="12"
                            fill="black"
                            textAnchor="middle"
                        >
                            {edge.weight}
                        </text>
                    </g>
                ))}
                {nodes.map((node) => (
                    <g
                    key={node.id}
                    onClick={() => handleNodeClick(node)}
                    style={{
                        transform: `translate(${node.x}px, ${node.y}px)`,
                        cursor: 'pointer',
                    }}
                    >
                        <circle
                            cx={25}
                            cy={25}
                            r={20}
                            fill={
                                // Узел будет красным, если он выбран в процессе добавления ребра
                                (addingEdge && selectedNode && selectedNode.id === node.id) ? 'red' :
                                (addingEdge && secondNode && secondNode.id === node.id) ? 'red' : 'blue'
                            }
                        />
                        <text
                            x={25}
                            y={25}
                            fontSize="12"
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="central"
                        >
                            {node.id}
                        </text>
                    </g>
                ))}
            </>
        );
    };

    return (
        <div className="container">
            <div className="button-panel">
                <button className="button" onClick={startAddingNode}>Добавить узел</button>
                <button className="button" onClick={startDeletingNode}>Удалить узел</button>
                <button className="button" onClick={startAddingEdge}>Соединить узлы</button>
            </div>
            <div className="message-box">{message}</div>
            {showEdgeEditor && (
              <div className="edge-editor-modal">
                    <div className="edge-editor-content">
                        <span className="close-button" onClick = {handleClose}>
                            &times;</span>
                        <h3>Редактор ребра</h3>
                        <label>Вес ребра:</label>
                        <input 
                            type="text" 
                            value={edgeWeight} 
                            onChange={handleWeightChange} 
                            placeholder="Введите вес" 
                        />
                        <div>
                            <label>Ориентированный</label>
                            {/* <input type="radio" name="direction" value="directed" defaultChecked onChange={() => setIsDirected(true)} /> */}
                            <label>Неориентированный</label>
                            {/* <input type="radio" name="direction" value="undirected" onChange={() => setIsDirected(false)} /> */}
                        </div>
                        <button onClick={handleOkClick}>ОК</button>
                    </div>
              </div>
          )}
            <svg
                ref={svgRef}
                className="graph-container"
                onClick={handleClick}
                width="800"
                height="600"
            >
                {renderGraph()}
            </svg>
            <div className="message-box-nodes">
                {nodes.map(node => node.id).join(', ')}
            </div>
            <div className="message-box-edges">
                {edges.map(edge => `${edge.start.id} => ${edge.end.id} (Вес: ${edge.weight})`).join(', ')}
            </div>

        </div>
    );
};
export default App;