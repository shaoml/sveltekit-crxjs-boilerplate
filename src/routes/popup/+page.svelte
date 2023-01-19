
<script>
  import { onMount } from 'svelte';

  let counter = 0

  onMount(() => {
    const u = setInterval(() => {
      counter = counter + 1
    }, 1000)

    return () => {
      clearInterval(u)
    }
  })
</script>

<div>{counter}</div>