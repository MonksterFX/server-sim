<script lang="ts">
  import { onMount } from "svelte";
  // Fixed import: assume editor/starter.ts exports a startEditor, try omitting extension or fix path if it is incorrect
  // If module resolution is an issue, adjust import as needed:
  import { startEditor } from "@server-sim/editor";
  onMount(() => {
    startEditor("editor-container");
  });
</script>

<div id="app">
  <h1>Node Editor</h1>
  <p>
    Use the toolbar buttons to add nodes, connect nodes, and delete
    nodes/connections. You can also click on the grid to place nodes, drag to
    move them.
  </p>
  <div id="editor-container"></div>
</div>
