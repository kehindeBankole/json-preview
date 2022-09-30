import React, { useCallback , useEffect } from "react";
import ReactFlow, {
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "react-flow-renderer";
import dagre from "dagre";

import { initialNodes, initialEdges } from "./initials.js";
import {newNodes , newEdges} from './nodes'

import "./index.css";







console.log(newNodes,  newEdges );

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 272;
const nodeHeight = 76;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? "left" : "top";
    node.sourcePosition = isHorizontal ? "right" : "bottom";

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return node;
  });

  return { nodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  newNodes,
  newEdges
);

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  useEffect(() => {
    onLayout("LR")
  }, [])
  

  return (
    <div style={{ width: "100vw", height: "100vh" }} className="layoutflow">
      <div style={{ width: "100%", height: "100%" }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
          />
          <Controls />
          <Background style={{background: '#011627'}} color="red" />
        </ReactFlowProvider>
      </div>
      <div className="controls">
        <button onClick={() => onLayout("TB")}>vertical layout</button>
        <button onClick={() => onLayout("LR")}>horizontal layout</button>
      </div>
    </div>
  );
};

export default LayoutFlow;
