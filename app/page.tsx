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

const defaultResult = {
  fraud_probability: 0.9940192741004935,
  graph: {
    nodes: [
      { id: "0", label: "0xf6e5b93ca5392daeedda967517d41d22de76b9d5" },
      { id: "1", label: "0x0a888f0f0b772e17a2adfd62d3f15cec72c8d42f" },
      { id: "2", label: "0x1f0ba96d17a14aa0f255c6fcee195568ae477406" },
      { id: "3", label: "0x0d35be8c62571d511315843e4512a47fdfccbbfd" },
      { id: "4", label: "0xe892d7013d2857d95aa1b8d30cb7b5afaa9147a4" },
      { id: "5", label: "0x42c8cfaf9b4033677916424c00018c7fa09f3c00" },
      { id: "6", label: "0xdf366d2e1742a5a819765bb97864778f0bea033c" },
      { id: "7", label: "0x748f4a52af4fb5c81f35674105d3ebc094b97e2b" },
      { id: "8", label: "0x51dd014a10ed7b43e85c1ec78968dba3563ab7ee" },
      { id: "9", label: "0xae6485b219427a1b77c8c6ad6284260274a0e104" },
      { id: "10", label: "0x489f36b6bf469754287b58b71fbdde839d1d7005" },
      { id: "11", label: "0xedb9f14e922e99a59b91d1ba0bdafb76765cb304" },
      { id: "12", label: "0x62744aaf0dd297b7fadccbf67910ba5d259d7ad1" },
      { id: "13", label: "0x8dbd5cf45d227d3e7e91baa02379b7f1d8dbaab6" },
      { id: "14", label: "0x0513747583f67e7d435e965ef5c76b9c1c942ea2" },
      { id: "15", label: "0x9c8409286f7e7f8775dece00e526f1a71b8b31e9" },
      { id: "16", label: "0xe04ab7cde6f903d1dd259b6884bc0937aa9f9c22" },
      { id: "17", label: "0xc2d81028bb66038ec8ef6b0a9914e190d545183d" },
      { id: "18", label: "0x2091e0bc6f80c3423af41e98d0b7d4bf94371f26" }
    ],
    edges: [
      { source: "0", target: "1", value: 0.0117574, timestamp: "2018-05-05 02:36:05" },
      { source: "1", target: "2", value: 0.75, timestamp: "2018-05-06 06:07:31" },
      { source: "1", target: "3", value: 0.19308909, timestamp: "2018-05-06 17:56:28" },
      { source: "1", target: "4", value: 0.96960534, timestamp: "2018-05-06 21:51:11" },
      { source: "1", target: "5", value: 0.1, timestamp: "2018-05-07 07:09:36" },
      { source: "1", target: "6", value: 0.78, timestamp: "2018-05-07 07:41:22" },
      { source: "1", target: "7", value: 2.09, timestamp: "2018-05-07 11:00:35" },
      { source: "1", target: "8", value: 30.0, timestamp: "2018-05-07 23:34:46" },
      { source: "1", target: "9", value: 0.8, timestamp: "2018-05-08 02:04:14" },
      { source: "1", target: "10", value: 3.0, timestamp: "2018-05-08 02:54:52" },
      { source: "1", target: "11", value: 0.18999, timestamp: "2018-05-10 06:36:53" },
      { source: "1", target: "12", value: 1.0, timestamp: "2018-05-10 22:48:30" },
      { source: "1", target: "13", value: 1.3, timestamp: "2018-05-11 11:27:30" },
      { source: "1", target: "14", value: 1.15, timestamp: "2018-05-17 15:14:38" },
      { source: "1", target: "15", value: 0.8, timestamp: "2018-05-13 19:15:27" },
      { source: "1", target: "16", value: 1.3, timestamp: "2018-05-13 19:41:40" },
      { source: "1", target: "17", value: 1.2, timestamp: "2018-05-16 10:40:16" },
      { source: "1", target: "18", value: 31.02755383, timestamp: "2018-05-17 16:22:39" }
    ]
  }
};

export default function Home() {
  const [walletAddress, setWalletAddress] = useState("0x0a888f0f0b772e17a2adfd62d3f15cec72c8d42f");
  const [classificationResult, setClassificationResult] = useState(defaultResult);
  const [error, setError] = useState<string | null>(null);

  const getFraudColor = (probability: number) => {
    if (probability < 0.25) return { color: '#22c55e', label: 'Low Risk', emoji: '😊' };
    if (probability < 0.75) return { color: '#f59e0b', label: 'Medium Risk', emoji: '🤔' };
    return { color: '#ef4444', label: 'High Risk', emoji: '😈' };
  };

  const [loading, setLoading] = useState(false);

  const classifyWallet = async () => {
    setError(null);
    setClassificationResult(null);
    setLoading(true); // 🔹 start loading
    try {
      const response = await axios.post("/api/classify", {
        wallet_address: walletAddress,
        model_name: "first_Feather-G_RF.joblib",
      });
      setClassificationResult(response.data);
    } catch (err) {
      console.error("Error classifying wallet:", err);
      setError("Failed to classify the wallet. Please try again.");
    } finally {
      setLoading(false); // 🔹 stop loading
    }
  };
  

  const isValidEthereumAddress = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);

  useEffect(() => {
    if (!classificationResult) return;
  
    const header = document.getElementById("header");
    const footer = document.getElementById("footer");
    const resultLabel = document.getElementById("result-label");

  
    const getContainerSize = () => {
      const headerHeight = header ? header.offsetHeight : 0;
      const footerHeight = footer ? footer.offsetHeight : 0;
      const labelHeight = resultLabel ? resultLabel.offsetHeight : 0;
  
      return {
        width: window.innerWidth,
        height: window.innerHeight - headerHeight - footerHeight - labelHeight - 32, // 16px extra spacing for margins
      };
    };

    const { width: containerWidth, height: containerHeight } = getContainerSize();
  
    const svg = d3.select("#graph")
      .attr("width", containerWidth)
      .attr("height", containerHeight);
  
    svg.selectAll("*").remove();
  
    const simulation = d3
      .forceSimulation<NodeDatum>(classificationResult.graph.nodes)
      .force(
        "link",
        d3.forceLink<NodeDatum, EdgeDatum>(classificationResult.graph.edges)
          .id(d => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2));
  
    const link = svg.append("g")
      .selectAll("line")
      .data(classificationResult.graph.edges)
      .enter()
      .append("line")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);
  
    const edgeLabels = svg.append("g")
      .selectAll("text")
      .data(classificationResult.graph.edges)
      .enter()
      .append("text")
      .attr("font-size", "12px")
      .attr("fill", "#facc15")
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text(d => `${d.value} ETH on ${new Date(d.timestamp).toLocaleDateString()}`);
  
    const otherNodes = svg.append("g")
      .selectAll("circle")
      .data(classificationResult.graph.nodes.filter(d => d.label.toLowerCase() !== walletAddress.toLowerCase()))
      .enter()
      .append("circle")
      .attr("r", 18)
      .attr("fill", "#6b7280")
      .attr("stroke", "#374151")
      .attr("stroke-width", 2)
      .call(d3.drag<SVGCircleElement, NodeDatum>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
    const centralNode = svg.append("g")
      .selectAll("text")
      .data(classificationResult.graph.nodes.filter(d => d.label.toLowerCase() === walletAddress.toLowerCase()))
      .enter()
      .append("text")
      .attr("font-size", "50px")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .text(() => getFraudColor(classificationResult.fraud_probability).emoji)
      .call(d3.drag<SVGTextElement, NodeDatum>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
  
    const nodeLabels = svg.append("g")
      .selectAll("text")
      .data(classificationResult.graph.nodes)
      .enter()
      .append("text")
      .attr("font-size", "14px")
      .attr("fill", d => d.label.toLowerCase() === walletAddress.toLowerCase()
        ? getFraudColor(classificationResult.fraud_probability).color
        : "#d1d5db")
      .attr("text-anchor", "middle")
      .attr("dy", -25)
      .text(d => d.label);
  
    function highlightNode(this: any, event: any, d: NodeDatum) {
      otherNodes.attr("fill", "#9ca3af").style("opacity", 0.2);
      centralNode.style("opacity", 0.2);
      link.attr("stroke", "#9ca3af").style("opacity", 0.1);
      nodeLabels.attr("fill", "#9ca3af").style("opacity", 0.2);
      edgeLabels.style("opacity", 0);
  
      d3.select(this).attr("fill", "#6b7280").style("opacity", 1);
  
      link.filter(l => (l.source as NodeDatum).id === d.id || (l.target as NodeDatum).id === d.id)
        .attr("stroke", "#facc15")
        .style("opacity", 1)
        .each(function(l: EdgeDatum) {
          otherNodes.filter(n => n.id === (l.source as NodeDatum).id || n.id === (l.target as NodeDatum).id)
            .attr("fill", "#6b7280")
            .style("opacity", 1);
          nodeLabels.filter(n => n.id === (l.source as NodeDatum).id || n.id === (l.target as NodeDatum).id)
            .attr("fill", "#ffffff")
            .style("opacity", 1);
          edgeLabels.filter(e => e === l).style("opacity", 1);
        });
  
      nodeLabels.filter(n => n.label.toLowerCase() === walletAddress.toLowerCase())
        .attr("fill", getFraudColor(classificationResult.fraud_probability).color)
        .style("opacity", 1);
  
      centralNode.style("opacity", 1);
    }
  
    function resetHighlight() {
      otherNodes.attr("fill", "#6b7280").style("opacity", 1);
      centralNode.style("opacity", 1);
      link.attr("stroke", "#555").style("opacity", 0.6);
      nodeLabels.attr("fill", d => d.label.toLowerCase() === walletAddress.toLowerCase()
        ? getFraudColor(classificationResult.fraud_probability).color
        : "#d1d5db").style("opacity", 1);
      edgeLabels.style("opacity", 0);
    }
  
    otherNodes.on("mouseover", highlightNode).on("mouseout", resetHighlight);
    centralNode.on("mouseover", highlightNode).on("mouseout", resetHighlight);
  
    function dragstarted(event: any, d: NodeDatum) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    function dragged(event: any, d: NodeDatum) {
      d.fx = event.x;
      d.fy = event.y;
    }
  
    function dragended(event: any, d: NodeDatum) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as NodeDatum).x!)
        .attr("y1", d => (d.source as NodeDatum).y!)
        .attr("x2", d => (d.target as NodeDatum).x!)
        .attr("y2", d => (d.target as NodeDatum).y!);
  
      edgeLabels
        .attr("x", d => ((d.source as NodeDatum).x! + (d.target as NodeDatum).x!) / 2)
        .attr("y", d => ((d.source as NodeDatum).y! + (d.target as NodeDatum).y!) / 2);
  
      otherNodes.attr("cx", d => d.x!).attr("cy", d => d.y!);
      centralNode.attr("x", d => d.x!).attr("y", d => d.y!);
      nodeLabels.attr("x", d => d.x!).attr("y", d => d.y!);
    });
  
    // 🔹 Responsive: update SVG size on window resize
    const handleResize = () => {
      const { width, height } = getContainerSize();
      svg.attr("width", width).attr("height", height);
      simulation.force("center", d3.forceCenter(width / 2, height / 2));
      simulation.alpha(0.3).restart();
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  
  }, [classificationResult]);
  

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <header id="header" className="w-full py-3 px-4 bg-gray-800 shadow-md">
        {/* Mobile-first responsive header */}
        <div className="flex flex-col items-center space-y-2 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
          {/* Logo and EthXpose title */}
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 256 417"
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              <path fill="#343434" d="M127.6 0L127.6 279.4 0 208.3z" />
              <path fill="#8C8C8C" d="M127.6 0L256 208.3 127.6 279.4z" />
              <path fill="#3C3C3B" d="M127.6 320.5L127.6 417 0 261.2z" />
              <path fill="#8C8C8C" d="M127.6 417L256 261.2 127.6 320.5z" />
              <path fill="#141414" d="M127.6 279.4L0 208.3 127.6 160.8z" />
              <path fill="#393939" d="M127.6 160.8L256 208.3 127.6 279.4z" />
            </svg>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">EthXpose</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Detect fraudulent Ethereum wallets</p>
            </div>
          </div>
          
          {/* Main title - responsive */}
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight">
              <span className="block sm:hidden">Ethereum Wallet</span>
              <span className="block sm:hidden">Fraud Detection</span>
              <span className="hidden sm:block">Ethereum Wallet Fraud Detection</span>
            </h2>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start px-2 sm:px-4 space-y-4 sm:space-y-6">
        {classificationResult && (
          <div id="result-label" className="mt-4 sm:mt-6 text-center px-2">
            <p 
              className="text-lg sm:text-xl font-semibold"
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
        {loading ? (
          <div className="mt-4 sm:mt-8 flex flex-col items-center justify-center w-full h-64 space-y-4">
            {/* Spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400"></div>
            {/* Message */}
            <p className="text-center text-sm text-gray-300">
              The first request may take some time to wake up the server...
            </p>
          </div>
        ) : (
          <svg id="graph" className="mt-4 sm:mt-8 w-full h-full" />
        )}
      </main>

      <footer id="footer" className="w-full py-4 sm:py-6 bg-gray-800 shadow-md text-center">
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full justify-center">
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 256 417"
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
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
                className="w-full sm:w-[calc(42ch)] py-3 pl-10 pr-4 rounded-lg bg-gray-800 text-gray-300 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
              />
            </div>
            <button
              onClick={classifyWallet}
              disabled={!walletAddress || !isValidEthereumAddress(walletAddress)}
              className="w-full sm:w-[calc(13ch)] py-3 px-4 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:bg-gray-500 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Check Wallet
            </button>
          </div>
          <p className="text-center text-gray-300 text-xs sm:text-sm w-full max-w-4xl px-2">
            Enter a wallet address to classify its fraud probability and view the
            transaction graph.
          </p>
          {error && <p className="text-red-500 text-sm px-2">{error}</p>}
        </div>
      </footer>
    </div>
  );
}
