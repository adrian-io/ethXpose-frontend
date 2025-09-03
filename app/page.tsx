"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import * as d3 from "d3";

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface EdgeDatum {
  source: string | NodeDatum;
  target: string | NodeDatum;
  value: number;
  timestamp: string;
}

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("0x0a888f0f0b772e17a2adfd62d3f15cec72c8d42f");
  const [classificationResult, setClassificationResult] = useState<{
    fraud_probability: number;
    graph: {
      nodes: NodeDatum[];
      edges: EdgeDatum[];
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getFraudColor = (probability: number) => {
    if (probability < 0.25) return { color: '#22c55e', label: 'Low Risk', emoji: '😊' }; // Green (bg-green-500)
    if (probability < 0.75) return { color: '#f59e0b', label: 'Medium Risk', emoji: '🤔' }; // Orange/Yellow
    return { color: '#ef4444', label: 'High Risk', emoji: '😈' }; // Red
  };

  const classifyWallet = async () => {
    setError(null);
    setClassificationResult(null);
    try {
      const response = await axios.post("/api/classify", {
        wallet_address: walletAddress,
        model_name: "first_Feather-G_RF.joblib",
      });
      setClassificationResult(response.data);
    } catch (err) {
      console.error("Error classifying wallet:", err);
      setError("Failed to classify the wallet. Please try again.");
    }
  };

  const isValidEthereumAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  useEffect(() => {
    if (!classificationResult) return;

    const svg = d3.select("#graph");
    const width = 800;
    const height = 600;

    svg.selectAll("*").remove();

    const simulation = d3
      .forceSimulation<NodeDatum>(classificationResult.graph.nodes)
      .force(
        "link",
        d3
          .forceLink<NodeDatum, EdgeDatum>(classificationResult.graph.edges)
          .id((d: NodeDatum) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(classificationResult.graph.edges)
      .enter()
      .append("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Create tooltip for edge labels (hidden by default)
    const edgeTooltip = svg
      .append("g")
      .selectAll("text")
      .data(classificationResult.graph.edges)
      .enter()
      .append("text")
      .attr("font-size", "11px")
      .attr("fill", "#e5e7eb")
      .attr("text-anchor", "middle")
      .attr("opacity", 0)
      .text((d: EdgeDatum) => `${d.value} ETH • ${new Date(d.timestamp).toLocaleDateString()}`);

    // Create circles for non-central nodes
    const otherNodes = svg
      .append("g")
      .selectAll("circle")
      .data(classificationResult.graph.nodes.filter((d: NodeDatum) => d.label.toLowerCase() !== walletAddress.toLowerCase()))
      .enter()
      .append("circle")
      .attr("r", 12)
      .attr("fill", "#6b7280") // Neutral gray for other nodes
      .attr("stroke", "#374151") // Darker gray stroke for other nodes
      .attr("stroke-width", 2);

    // Create emoji for central node
    const centralNode = svg
      .append("g")
      .selectAll("text")
      .data(classificationResult.graph.nodes.filter((d: NodeDatum) => d.label.toLowerCase() === walletAddress.toLowerCase()))
      .enter()
      .append("text")
      .attr("font-size", "24px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text((d: NodeDatum) => getFraudColor(classificationResult.fraud_probability).emoji)
      .on("mouseover", function(event: any, d: NodeDatum) {
        // Highlight connected edges
        link
          .transition()
          .duration(200)
          .attr("stroke-opacity", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 1 : 0.2;
          })
          .attr("stroke-width", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 3 : 2;
          });
        
        // Show edge labels for connected edges
        edgeTooltip
          .transition()
          .duration(200)
          .attr("opacity", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 1 : 0;
          });
      })
      .on("mouseout", function(event: any, d: NodeDatum) {
        // Reset edge appearance
        link
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2);
        
        // Hide edge labels
        edgeTooltip
          .transition()
          .duration(200)
          .attr("opacity", 0);
      });

    // Add hover interactions to all nodes
    otherNodes
      .on("mouseover", function(event: any, d: NodeDatum) {
        // Highlight connected edges
        link
          .transition()
          .duration(200)
          .attr("stroke-opacity", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 1 : 0.2;
          })
          .attr("stroke-width", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 3 : 2;
          });
        
        // Show edge labels for connected edges
        edgeTooltip
          .transition()
          .duration(200)
          .attr("opacity", (edgeData: EdgeDatum) => {
            const source = (edgeData.source as NodeDatum).label || edgeData.source;
            const target = (edgeData.target as NodeDatum).label || edgeData.target;
            return (source === d.label || target === d.label) ? 1 : 0;
          });
      })
      .on("mouseout", function(event: any, d: NodeDatum) {
        // Reset edge appearance
        link
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", 2);
        
        // Hide edge labels
        edgeTooltip
          .transition()
          .duration(200)
          .attr("opacity", 0);
      })
      .call(
        d3
          .drag<SVGCircleElement, NodeDatum>()
          .on("start", (event: any, d: NodeDatum) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("drag", (event: any, d: NodeDatum) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event: any, d: NodeDatum) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Create node labels (always visible)
    const nodeLabels = svg
      .append("g")
      .selectAll("text")
      .data(classificationResult.graph.nodes)
      .enter()
      .append("text")
      .attr("font-size", "10px")
      .attr("fill", (d: NodeDatum) => {
        if (d.label.toLowerCase() === walletAddress.toLowerCase()) {
          return getFraudColor(classificationResult.fraud_probability).color;
        }
        return "#d1d5db"; // Light gray for other nodes
      })
      .attr("text-anchor", "middle")
      .attr("dy", -25)
      .text((d: NodeDatum) => d.label);

    simulation.on("tick", () => {
      link
        .attr("x1", (d: EdgeDatum) => ((d.source as unknown) as NodeDatum).x!)
        .attr("y1", (d: EdgeDatum) => ((d.source as unknown) as NodeDatum).y!)
        .attr("x2", (d: EdgeDatum) => ((d.target as unknown) as NodeDatum).x!)
        .attr("y2", (d: EdgeDatum) => ((d.target as unknown) as NodeDatum).y!);

      edgeTooltip
        .attr("x", (d: EdgeDatum) =>
          ((((d.source as unknown) as NodeDatum).x! +
            ((d.target as unknown) as NodeDatum).x!) /
            2)
        )
        .attr("y", (d: EdgeDatum) =>
          ((((d.source as unknown) as NodeDatum).y! +
            ((d.target as unknown) as NodeDatum).y!) /
            2)
        );

      // Position circles for other nodes
      otherNodes.attr("cx", (d: NodeDatum) => d.x as number).attr("cy", (d: NodeDatum) => d.y as number);
      
      // Position emoji for central node
      centralNode.attr("x", (d: NodeDatum) => d.x as number).attr("y", (d: NodeDatum) => d.y as number);

      nodeLabels.attr("x", (d: NodeDatum) => d.x as number).attr("y", (d: NodeDatum) => d.y as number);
    });
  }, [classificationResult]);

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <header className="w-full py-4 px-6 bg-gray-800 shadow-md relative flex justify-between items-center">
        {/* Left section: logo and EthXpose title */}
        <div className="flex items-start space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 417"
            className="w-10 h-10"
          >
            <path fill="#343434" d="M127.6 0L127.6 279.4 0 208.3z" />
            <path fill="#8C8C8C" d="M127.6 0L256 208.3 127.6 279.4z" />
            <path fill="#3C3C3B" d="M127.6 320.5L127.6 417 0 261.2z" />
            <path fill="#8C8C8C" d="M127.6 417L256 261.2 127.6 320.5z" />
            <path fill="#141414" d="M127.6 279.4L0 208.3 127.6 160.8z" />
            <path fill="#393939" d="M127.6 160.8L256 208.3 127.6 279.4z" />
          </svg>
          <div>
            <h1 className="text-3xl font-bold">EthXpose</h1>
            <p className="text-xs text-gray-400">Detect Fraudulent Ethereum wallets</p>
          </div>
        </div>
        {/* Center section */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 flex items-center h-full">
          <h2 className="text-3xl font-bold">
            Ethereum Wallet Fraud Detection
          </h2>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start px-4 space-y-6">
        {classificationResult && (
          <div className="mt-6 text-center">
            <p 
              className="text-xl font-semibold"
              style={{ color: getFraudColor(classificationResult.fraud_probability).color }}
            >
              Fraud Probability: {(classificationResult.fraud_probability * 100).toFixed(2)}%
            </p>
            <p 
              className="text-sm font-medium mt-1"
              style={{ color: getFraudColor(classificationResult.fraud_probability).color }}
            >
              {getFraudColor(classificationResult.fraud_probability).label}
            </p>
          </div>
        )}
        <svg
          id="graph"
          className="mt-8 w-full"
          height="600"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        />
      </main>

      <footer className="w-full py-6 bg-gray-800 shadow-md text-center">
        <div className="flex flex-col items-center space-y-4 w-full max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-4 w-full max-w-4xl justify-center">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 417"
                  className="w-5 h-5 text-gray-400"
                >
                  <path fill="currentColor" d="M127.6 0L127.6 279.4 0 208.3z" />
                  <path fill="currentColor" d="M127.6 0L256 208.3 127.6 279.4z" />
                  <path fill="currentColor" d="M127.6 320.5L127.6 417 0 261.2z" />
                  <path fill="currentColor" d="M127.6 417L256 261.2 127.6 320.5z" />
                  <path fill="currentColor" d="M127.6 279.4L0 208.3 127.6 160.8z" />
                  <path fill="currentColor" d="M127.6 160.8L256 208.3 127.6 279.4z" />
                </svg>
              </div>
              <input
                type="text"
                value={walletAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWalletAddress(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && walletAddress && isValidEthereumAddress(walletAddress)) {
                    classifyWallet();
                  }
                }}
                placeholder="Enter wallet address"
                className="w-[calc(42ch)] py-3 pl-10 pr-4 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              onClick={classifyWallet}
              disabled={!walletAddress || !isValidEthereumAddress(walletAddress)}
              className="w-[calc(13ch)] py-3 px-4 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Check Wallet
            </button>
          </div>
          <p className="text-center text-gray-300 text-sm w-full max-w-4xl">
            Enter a wallet address to classify its fraud probability and view the
            transaction graph.
          </p>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </footer>
    </div>
  );
}
