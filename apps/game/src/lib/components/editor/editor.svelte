<script lang="ts">
  import {
    SvelteFlow,
    Background,
    Controls,
    Panel,
    type Connection,
  } from "@xyflow/svelte";
  import "@xyflow/svelte/dist/style.css";
  import "./xy-theme.css";

  import Base from "./nodes/Base.svelte";
  import Producer from "./nodes/Producer.svelte";
  import Consumer from "./nodes/Consumer.svelte";
  import EditorState from "./state";

  const state = new EditorState();
  let { nodes, edges } = state;
  // import { EditorNetworkAdapter } from '@server-sim/editor/adapter';

  // let adapter: EditorNetworkAdapter;

  const nodeTypes = {
    base: Base,
    producer: Producer,
    consumer: Consumer,
  };

  function isValidConnection(connection: Connection) {
    // TODO: check if nodes are connectable
    return true;
  }
</script>

<div style:width="100vw" style:height="100vh">
  <SvelteFlow bind:nodes bind:edges {nodeTypes} {isValidConnection}>
    <Background />
    <Controls />
    <Panel position="top-left">
      <button
        class="xy-theme__button"
        onclick={() => {
          state.addNode({
            id: window.crypto.randomUUID(),
            type: "fadeInOut",
            position: {
              x: Math.random() * 300,
              y: Math.random() * 200 - 100,
            },
            data: { label: "New Node" },
          });
        }}>Add node</button
      >
    </Panel>
  </SvelteFlow>
</div>
