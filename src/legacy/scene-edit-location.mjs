let config;
export async function sceneEditURL(path){
 if(!path.startsWith('/scene-edits-v25/'))return path;
 config??=fetch('/scene-edit-origin.json').then(r=>r.ok?r.json():{}).catch(()=>({}));
 const {origin=''}=await config;return origin+path;
}
export function setSceneEditImage(img,path){if(!path.startsWith('/scene-edits-v25/')){img.src=path;return;}sceneEditURL(path).then(url=>{if(img.isConnected!==false)img.src=url;});}
