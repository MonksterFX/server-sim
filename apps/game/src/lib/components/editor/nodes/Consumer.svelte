<script lang="ts">
  import {
    Position,
    Handle,
    useNodeConnections,
    type NodeProps,
  } from "@xyflow/svelte";

  let {}: NodeProps = $props();

  //   const connections = useNodeConnections({ handleType: "target" });
</script>

<Handle type="target" position={Position.Left} />
<div>{"Consumer"}</div>
