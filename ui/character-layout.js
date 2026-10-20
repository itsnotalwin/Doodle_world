// Pure display geometry shared by generated, inherited and freehand residents.
// Saved strokes and genes are never rewritten by layout.
export function characterLayout(strokes, child=false) {
  const mapped=strokes.map(path=>path.map(([x,y])=>[(x-.5)*90,(y-.57)*110]));
  let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
  for(const path of mapped)for(const [x,y] of path){
    left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  const ageScale=child ? 0.65 : 1;
  if(left===Infinity) return {paths:[],bounds:{left:0,right:0,top:0,bottom:0},ageScale,fit:1};
  const fit=Math.min(1,56/Math.max(1,right-left),78/Math.max(1,bottom-top)),scale=fit*ageScale;
  const paths=mapped.map(path=>path.map(([x,y])=>[x*scale,y*scale]));
  return {paths,ageScale,fit,bounds:{left:left*scale,right:right*scale,top:top*scale,bottom:bottom*scale}};
}

export function characterAnnotations(bounds, leader=false) {
  return {
    nameY:bounds.bottom+14,
    roleY:bounds.top-10,
    actionX:bounds.right+12,
    actionY:Math.max(bounds.top+35,-6),
    bubble:{left:-102,top:bounds.top-(leader?50:34),width:204,height:24}
  };
}

export function rectanglesOverlap(a,b,padding=0) {
  return a.left<b.right+padding&&a.right>b.left-padding&&a.top<b.bottom+padding&&a.bottom>b.top-padding;
}

export function placeLabel(rect,occupied,padding=4) {
  if(occupied.some(other=>rectanglesOverlap(rect,other,padding))) return false;
  occupied.push(rect);
  return true;
}
