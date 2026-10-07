// Presentation privacy: show one room at a time, never the whole property outline.
// This is a display policy, not authentication or source-code access control.
export function privateRoomView(requested, selected='living') {
  return ['all','top'].includes(requested) ? selected : requested;
}
export function isolatePrivateRoom(model, selected) {
  if (!model) return;
  const rooms=model.userData.rooms;
  for (const child of model.children) child.visible=false;
  for (const [id,room] of rooms) room.visible=id===selected ||
    (['living','dining'].includes(selected) && ['living','dining'].includes(id));
}
