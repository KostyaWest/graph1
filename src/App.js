import React, { useState, useEffect, useRef } from 'react';
import './graph.css';
import './edgeconfig.css'

const App = () => {
    const [nodes, setNodes] = useState([]);
    const [addingNode, setAddingNode] = useState(false);
    const [lastNodeId, setLastNodeId] = useState(0);

    const [deletingNode, setDeletingNode] = useState(false);

    const [edges, setEdges] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null); // Для хранения выбранного узла для рёбер
    const [addingEdge, setAddingEdge] = useState(false);
    const [showEdgeEditor, setShowEdgeEditor] = useState(false); // Модальное окно для работы с ребрами
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

    // Функция для начала удаления узла
    const startDeletingNode = () => {
        setAddingNode(false);
        setAddingEdge(false);
        setDeletingNode(true);
        setMessage("Кликните на узел, чтобы удалить его");
    };


    const handleNodeClick = (node) => {
        if (addingEdge) {
            if (selectedNode === null) {
                setSelectedNode(node);
                setMessage("Кликните на второй узел для создания ребра");
            } else {
                // Получаем начальный и конечный узел
                const startNode = selectedNode;
                const endNode = node;

                setShowEdgeEditor(true); //вызов модального окна

                const isEdgeExist = edges.some((edge) => 
                    (edge.start.id === startNode.id && edge.end.id === endNode.id)
                );
                
                if (isEdgeExist) {
                    setSelectedNode(null); // Снимаем выделение с узлов
                    setAddingEdge(false);  // Завершаем процесс добавления рёбер
                    return; // Если ребро существует, прерываем выполнение
                }
    
                // Сортируем id узлов, чтобы гарантировать уникальность идентификатора
                const edgeId = [startNode.id, endNode.id].sort().join('-'); // Формат "1-2", всегда в одном порядке
    
                // Рассчитываем координаты для рёбер
                const offsetX = 45; // Отступ от края по оси X
                const offsetY = 45; // Отступ от края по оси Y
    
                const edgeX = (startNode.x + offsetX + endNode.x + offsetX) / 2;
                const edgeY = (startNode.y + offsetY + endNode.y + offsetY) / 2;
    
                // Создаем новое ребро
                const newEdge = {
                    id: edgeId,    // Новый id ребра
                    start: startNode,
                    end: endNode,
                    x: edgeX,      // Местоположение для отображения ребра по оси X
                    y: edgeY,      // Местоположение для отображения ребра по оси Y
                };
    
                setEdges([...edges, newEdge]);
                setSelectedNode(null); // Снимаем выделение с узлов
                setAddingEdge(false);  // Завершаем процесс добавления рёбер
            }
        }
    };    

    useEffect(() => {
        if (addingNode) {
            setMessage("Кликните на по рабочей зоне, чтобы поставить узел");
        } else if (deletingNode) {
            setMessage("Кликните на узел, чтобы удалить его");
        } else {
            setMessage("Нажмите на кнопку для дальнейших действий");
        }
    }, [addingNode, deletingNode, addingEdge]);

    const handleClick = (e) => {
        // Клик по ребрам
        if (addingEdge || deletingNode) {
            const clickedEdge = e.target.closest('.edge');
            if (clickedEdge) {
                // Проверка на флаг добавления рёбер
                if (addingEdge) {
                    const clickedNode = e.target.closest('.node');
                    if (clickedNode) {
                        const nodeId = parseInt(clickedNode.getAttribute('data-id'), 10);
                        handleEdgeClick(nodeId); // Функция для соединения узлов
                    }
                }
                // Проверка на флаг удаления узлов
                else if (deletingNode) {
                    const clickedNode = e.target.closest('.node');
                    if (clickedNode) {
                        const nodeId = parseInt(clickedNode.getAttribute('data-id'), 10);
                        deleteNode(nodeId); // Функция для удаления узла
                    }
                }
            }
        }
        
        // Клик по рабочей поверхности
        else if (addingNode) {
            addNode(e); // Добавление нового узла
            setAddingNode(false); // Сброс флага
        }
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
    
    // Функция для удаления узла
    const deleteNode = (nodeId) => {
        setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
        setMessage("Узел удалён.");
        setDeletingNode(false); // Сброс флага удаления
    };
    
    // Функция для соединения узлов (при клике по узлам)
    const handleEdgeClick = (nodeId) => {
        if (selectedNode) {
            // Создание ребра
            const edgeId = `${selectedNode.id}-${nodeId}`;
            const newEdge = {
                id: edgeId,
                start: selectedNode,
                end: nodes.find(node => node.id === nodeId)
            };
            setEdges(prevEdges => [...prevEdges, newEdge]);
            setMessage("Ребро создано.");
        } else {
            setSelectedNode(nodes.find(node => node.id === nodeId));
            setMessage("Кликните на второй узел для создания ребра.");
        }
    };
    
    // Добавляем обработчик для клика по рабочей зоне
    const handleCanvasClick = (e) => {
        handleClick(e); // Вызов основной функции для обработки кликов
    };
    
    const renderGraph = () => {
        return (
            <>
                {edges.map((edge) => (
                    <g key={edge.id}> {/* Группируем линию и текст в один контейнер */}
                    {/* Отображение самого ребра */}
                    <line
                        x1={edge.start.x + 20}
                        y1={edge.start.y + 20}
                        x2={edge.end.x + 20}
                        y2={edge.end.y + 20}
                        stroke="black"
                        strokeWidth="2"
                    />
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
                            fill={selectedNode === node ? 'red' : 'blue'}
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
                        <span className="close-button" onClick={() => { 
                            setSelectedNode(null); // Снимаем выделение с узлов
                            setAddingEdge(false);  // Завершаем процесс добавления рёбер
                            setShowEdgeEditor(false);
                            setMessage("Нажмите на кнопку для дальнейших действий");
                            
                        }}>
                            &times;</span>
                        <h3>Редактор ребра</h3>
                        <label>Вес ребра:</label>
                        {/* <input type="text" value={edgeWeight} onChange={(e) => setEdgeWeight(e.target.value)} /> */}
                        <div>
                            <label>Ориентированный</label>
                            {/* <input type="radio" name="direction" value="directed" defaultChecked onChange={() => setIsDirected(true)} /> */}
                            <label>Неориентированный</label>
                            {/* <input type="radio" name="direction" value="undirected" onChange={() => setIsDirected(false)} /> */}
                        </div>
                        {/* <button onClick={createEdge}>ОК</button> */}
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
                {edges.map(edge => ` ${edge.start.id} => ${edge.end.id}`).join(', ')}
            </div>
        </div>
    );
};

export default App;
