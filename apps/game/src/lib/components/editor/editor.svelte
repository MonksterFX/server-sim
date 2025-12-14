<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { initializeEditor, cleanupEditor } from "$lib/stores/editorStore";

  let container: HTMLElement;

  onMount(() => {
    container = document.getElementById("editor-container")!;
    initializeEditor(container, { cellSize: 40 });
  });

  onDestroy(() => {
    cleanupEditor();
  });
</script>

<div id="editor-container"></div>
