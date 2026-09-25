export function offlineHtml(html,css,js,embedded){

  html=html.replace(/<script type="application\/json" id="vr-data">[\s\S]*?<\/script>/,'<script type="application/json" id="vr-data">'+JSON.stringify(embedded).replaceAll('<','\\u003c')+'</script>');
  html=html.replace('<link rel="stylesheet" href="/vr/dusk/vr.css">',()=>'<style>'+css.replaceAll('</style','<\\/style')+'</style>');
  html=html.replace('<script src="/vr/dusk/vr.js" defer></script>',()=>'<script>'+js.replaceAll('</script','<\\/script')+'</script>');
 return html;
}
