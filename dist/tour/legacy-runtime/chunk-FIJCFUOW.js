import{$ as be,C as ue,Ca as Se,D as pt,E as de,F as fe,G as me,O as _e,Oa as Ee,P as Pt,Q as _,R as Bt,Ra as xe,S as R,T as ge,V as ut,Y as ve,Z as Xt,a as X,b as W,cb as De,da as Wt,ea as Me,f as U,fa as ye,g as ie,gb as we,h as Kt,ha as I,i as Vt,ia as K,j as se,jb as Qt,k as oe,kb as Re,m as ae,n as ne,o as re,p as he,q as le,qa as Pe,r as ce,s as pe,t as Gt,ua as Te,w as Ht}from"./chunk-DRINV6WP.js";var Ce={type:"change"},Jt={type:"start"},Oe={type:"end"},Tt=new ve,Ae=new Te,ze=Math.cos(70*Pt.DEG2RAD),m=new R,x=2*Math.PI,l={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},qt=1e-6,Ne=class extends Re{constructor(t,e=null){super(t,e),this.state=l.NONE,this.target=new R,this.cursor=new R,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:X.ROTATE,MIDDLE:X.DOLLY,RIGHT:X.PAN},this.touches={ONE:W.ROTATE,TWO:W.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new R,this._lastQuaternion=new Bt,this._lastTargetPosition=new R,this._quat=new Bt().setFromUnitVectors(t.up,new R(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Qt,this._sphericalDelta=new Qt,this._scale=1,this._panOffset=new R,this._rotateStart=new _,this._rotateEnd=new _,this._rotateDelta=new _,this._panStart=new _,this._panEnd=new _,this._panDelta=new _,this._dollyStart=new _,this._dollyEnd=new _,this._dollyDelta=new _,this._dollyDirection=new R,this._mouse=new _,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Ke.bind(this),this._onPointerDown=Ye.bind(this),this._onPointerUp=Ve.bind(this),this._onContextMenu=qe.bind(this),this._onMouseWheel=Be.bind(this),this._onKeyDown=Xe.bind(this),this._onTouchStart=We.bind(this),this._onTouchMove=Qe.bind(this),this._onMouseDown=Ge.bind(this),this._onMouseMove=He.bind(this),this._interceptControlDown=Je.bind(this),this._interceptControlUp=$e.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ce),this.update(),this.state=l.NONE}update(t=null){let e=this.object.position;m.copy(e).sub(this.target),m.applyQuaternion(this._quat),this._spherical.setFromVector3(m),this.autoRotate&&this.state===l.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=x:i>Math.PI&&(i-=x),s<-Math.PI?s+=x:s>Math.PI&&(s-=x),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let o=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let n=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),o=n!=this._spherical.radius}if(m.setFromSpherical(this._spherical),m.applyQuaternion(this._quatInverse),e.copy(this.target).add(m),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let n=null;if(this.object.isPerspectiveCamera){let r=m.length();n=this._clampDistance(r*this._scale);let b=r-n;this.object.position.addScaledVector(this._dollyDirection,b),this.object.updateMatrixWorld(),o=!!b}else if(this.object.isOrthographicCamera){let r=new R(this._mouse.x,this._mouse.y,0);r.unproject(this.object);let b=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),o=b!==this.object.zoom;let h=new R(this._mouse.x,this._mouse.y,0);h.unproject(this.object),this.object.position.sub(h).add(r),this.object.updateMatrixWorld(),n=m.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;n!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(n).add(this.object.position):(Tt.origin.copy(this.object.position),Tt.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Tt.direction))<ze?this.object.lookAt(this.target):(Ae.setFromNormalAndCoplanarPoint(this.object.up,this.target),Tt.intersectPlane(Ae,this.target))))}else if(this.object.isOrthographicCamera){let n=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),n!==this.object.zoom&&(this.object.updateProjectionMatrix(),o=!0)}return this._scale=1,this._performCursorZoom=!1,o||this._lastPosition.distanceToSquared(this.object.position)>qt||8*(1-this._lastQuaternion.dot(this.object.quaternion))>qt||this._lastTargetPosition.distanceToSquared(this.target)>qt?(this.dispatchEvent(Ce),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?x/60*this.autoRotateSpeed*t:x/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){m.setFromMatrixColumn(e,0),m.multiplyScalar(-t),this._panOffset.add(m)}_panUp(t,e){this.screenSpacePanning===!0?m.setFromMatrixColumn(e,1):(m.setFromMatrixColumn(e,0),m.crossVectors(this.object.up,m)),m.multiplyScalar(t),this._panOffset.add(m)}_pan(t,e){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;m.copy(s).sub(this.target);let o=m.length();o*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*o/i.clientHeight,this.object.matrix),this._panUp(2*e*o/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=t-i.left,o=e-i.top,n=i.width,r=i.height;this._mouse.x=s/n*2-1,this._mouse.y=-(o/r)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(x*this._rotateDelta.x/e.clientHeight),this._rotateUp(x*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(x*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-x*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(x*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-x*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(i,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(i*i+s*s);this._dollyStart.set(0,o)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let i=this._getSecondPointerPosition(t),s=.5*(t.pageX+i.x),o=.5*(t.pageY+i.y);this._rotateEnd.set(s,o)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(x*this._rotateDelta.x/e.clientHeight),this._rotateUp(x*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),i=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),i=t.pageX-e.x,s=t.pageY-e.y,o=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,o),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let n=(t.pageX+e.x)*.5,r=(t.pageY+e.y)*.5;this._updateZoomParameters(n,r)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new _,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,i={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function Ye(a){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(a.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(a)&&(this._addPointer(a),a.pointerType==="touch"?this._onTouchStart(a):this._onMouseDown(a)))}function Ke(a){this.enabled!==!1&&(a.pointerType==="touch"?this._onTouchMove(a):this._onMouseMove(a))}function Ve(a){switch(this._removePointer(a),this._pointers.length){case 0:this.domElement.releasePointerCapture(a.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Oe),this.state=l.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Ge(a){let t;switch(a.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case X.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(a),this.state=l.DOLLY;break;case X.ROTATE:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=l.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=l.ROTATE}break;case X.PAN:if(a.ctrlKey||a.metaKey||a.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(a),this.state=l.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(a),this.state=l.PAN}break;default:this.state=l.NONE}this.state!==l.NONE&&this.dispatchEvent(Jt)}function He(a){switch(this.state){case l.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(a);break;case l.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(a);break;case l.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(a);break}}function Be(a){this.enabled===!1||this.enableZoom===!1||this.state!==l.NONE||(a.preventDefault(),this.dispatchEvent(Jt),this._handleMouseWheel(this._customWheelEvent(a)),this.dispatchEvent(Oe))}function Xe(a){this.enabled!==!1&&this._handleKeyDown(a)}function We(a){switch(this._trackPointer(a),this._pointers.length){case 1:switch(this.touches.ONE){case W.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(a),this.state=l.TOUCH_ROTATE;break;case W.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(a),this.state=l.TOUCH_PAN;break;default:this.state=l.NONE}break;case 2:switch(this.touches.TWO){case W.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(a),this.state=l.TOUCH_DOLLY_PAN;break;case W.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(a),this.state=l.TOUCH_DOLLY_ROTATE;break;default:this.state=l.NONE}break;default:this.state=l.NONE}this.state!==l.NONE&&this.dispatchEvent(Jt)}function Qe(a){switch(this._trackPointer(a),this.state){case l.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(a),this.update();break;case l.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(a),this.update();break;case l.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(a),this.update();break;case l.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(a),this.update();break;default:this.state=l.NONE}}function qe(a){this.enabled!==!1&&a.preventDefault()}function Je(a){a.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function $e(a){a.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var Q={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var N=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},ti=new De(-1,1,1,-1,0,1),$t=class extends Me{constructor(){super(),this.setAttribute("position",new Wt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Wt([0,2,0,0,2,0],2))}},ei=new $t,V=class{constructor(t){this._mesh=new ye(ei,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,ti)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}};var St=class extends N{constructor(t,e="tDiffuse"){super(),this.textureID=e,this.uniforms=null,this.material=null,t instanceof K?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=I.clone(t.uniforms),this.material=new K({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this._fsQuad=new V(this.material)}render(t,e,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var dt=class extends N{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,i){let s=t.getContext(),o=t.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0);let n,r;this.inverse?(n=0,r=1):(n=1,r=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),o.buffers.stencil.setFunc(s.ALWAYS,n,4294967295),o.buffers.stencil.setClear(r),o.buffers.stencil.setLocked(!0),t.setRenderTarget(i),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(s.EQUAL,1,4294967295),o.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),o.buffers.stencil.setLocked(!0)}},Et=class extends N{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}};var ke=class{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){let i=t.getSize(new _);this._width=i.width,this._height=i.height,e=new ut(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:pt}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new St(Q),this.copyPass.material.blending=U,this.clock=new we}swapBuffers(){let t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){let e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());let e=this.renderer.getRenderTarget(),i=!1;for(let s=0,o=this.passes.length;s<o;s++){let n=this.passes[s];if(n.enabled!==!1){if(n.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),n.render(this.renderer,this.writeBuffer,this.readBuffer,t,i),n.needsSwap){if(i){let r=this.renderer.getContext(),b=this.renderer.state.buffers.stencil;b.setFunc(r.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),b.setFunc(r.EQUAL,1,4294967295)}this.swapBuffers()}dt!==void 0&&(n instanceof dt?i=!0:n instanceof Et&&(i=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){let e=this.renderer.getSize(new _);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let o=0;o<this.passes.length;o++)this.passes[o].setSize(i,s)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var xt=class{constructor(t=Math){this.grad3=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],this.grad4=[[0,1,1,1],[0,1,1,-1],[0,1,-1,1],[0,1,-1,-1],[0,-1,1,1],[0,-1,1,-1],[0,-1,-1,1],[0,-1,-1,-1],[1,0,1,1],[1,0,1,-1],[1,0,-1,1],[1,0,-1,-1],[-1,0,1,1],[-1,0,1,-1],[-1,0,-1,1],[-1,0,-1,-1],[1,1,0,1],[1,1,0,-1],[1,-1,0,1],[1,-1,0,-1],[-1,1,0,1],[-1,1,0,-1],[-1,-1,0,1],[-1,-1,0,-1],[1,1,1,0],[1,1,-1,0],[1,-1,1,0],[1,-1,-1,0],[-1,1,1,0],[-1,1,-1,0],[-1,-1,1,0],[-1,-1,-1,0]],this.p=[];for(let e=0;e<256;e++)this.p[e]=Math.floor(t.random()*256);this.perm=[];for(let e=0;e<512;e++)this.perm[e]=this.p[e&255];this.simplex=[[0,1,2,3],[0,1,3,2],[0,0,0,0],[0,2,3,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,3,0],[0,2,1,3],[0,0,0,0],[0,3,1,2],[0,3,2,1],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,3,2,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[1,2,0,3],[0,0,0,0],[1,3,0,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,3,0,1],[2,3,1,0],[1,0,2,3],[1,0,3,2],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,3,1],[0,0,0,0],[2,1,3,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0],[2,0,1,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,0,1,2],[3,0,2,1],[0,0,0,0],[3,1,2,0],[2,1,0,3],[0,0,0,0],[0,0,0,0],[0,0,0,0],[3,1,0,2],[0,0,0,0],[3,2,0,1],[3,2,1,0]]}noise(t,e){let i,s,o,n=.5*(Math.sqrt(3)-1),r=(t+e)*n,b=Math.floor(t+r),h=Math.floor(e+r),D=(3-Math.sqrt(3))/6,O=(b+h)*D,L=b-O,M=h-O,P=t-L,w=e-M,k,j;P>w?(k=1,j=0):(k=0,j=1);let g=P-k+D,v=w-j+D,f=P-1+2*D,T=w-1+2*D,S=b&255,E=h&255,C=this.perm[S+this.perm[E]]%12,c=this.perm[S+k+this.perm[E+j]]%12,p=this.perm[S+1+this.perm[E+1]]%12,u=.5-P*P-w*w;u<0?i=0:(u*=u,i=u*u*this._dot(this.grad3[C],P,w));let d=.5-g*g-v*v;d<0?s=0:(d*=d,s=d*d*this._dot(this.grad3[c],g,v));let A=.5-f*f-T*T;return A<0?o=0:(A*=A,o=A*A*this._dot(this.grad3[p],f,T)),70*(i+s+o)}noise3d(t,e,i){let s,o,n,r,h=(t+e+i)*.3333333333333333,D=Math.floor(t+h),O=Math.floor(e+h),L=Math.floor(i+h),M=1/6,P=(D+O+L)*M,w=D-P,k=O-P,j=L-P,g=t-w,v=e-k,f=i-j,T,S,E,C,c,p;g>=v?v>=f?(T=1,S=0,E=0,C=1,c=1,p=0):g>=f?(T=1,S=0,E=0,C=1,c=0,p=1):(T=0,S=0,E=1,C=1,c=0,p=1):v<f?(T=0,S=0,E=1,C=0,c=1,p=1):g<f?(T=0,S=1,E=0,C=0,c=1,p=1):(T=0,S=1,E=0,C=1,c=1,p=0);let u=g-T+M,d=v-S+M,A=f-E+M,q=g-C+2*M,J=v-c+2*M,$=f-p+2*M,tt=g-1+3*M,et=v-1+3*M,y=f-1+3*M,G=D&255,H=O&255,B=L&255,vt=this.perm[G+this.perm[H+this.perm[B]]]%12,bt=this.perm[G+T+this.perm[H+S+this.perm[B+E]]]%12,Mt=this.perm[G+C+this.perm[H+c+this.perm[B+p]]]%12,yt=this.perm[G+1+this.perm[H+1+this.perm[B+1]]]%12,F=.6-g*g-v*v-f*f;F<0?s=0:(F*=F,s=F*F*this._dot3(this.grad3[vt],g,v,f));let Z=.6-u*u-d*d-A*A;Z<0?o=0:(Z*=Z,o=Z*Z*this._dot3(this.grad3[bt],u,d,A));let z=.6-q*q-J*J-$*$;z<0?n=0:(z*=z,n=z*z*this._dot3(this.grad3[Mt],q,J,$));let Y=.6-tt*tt-et*et-y*y;return Y<0?r=0:(Y*=Y,r=Y*Y*this._dot3(this.grad3[yt],tt,et,y)),32*(s+o+n+r)}noise4d(t,e,i,s){let o=this.grad4,n=this.simplex,r=this.perm,b=(Math.sqrt(5)-1)/4,h=(5-Math.sqrt(5))/20,D,O,L,M,P,w=(t+e+i+s)*b,k=Math.floor(t+w),j=Math.floor(e+w),g=Math.floor(i+w),v=Math.floor(s+w),f=(k+j+g+v)*h,T=k-f,S=j-f,E=g-f,C=v-f,c=t-T,p=e-S,u=i-E,d=s-C,A=c>p?32:0,q=c>u?16:0,J=p>u?8:0,$=c>d?4:0,tt=p>d?2:0,et=u>d?1:0,y=A+q+J+$+tt+et,G=n[y][0]>=3?1:0,H=n[y][1]>=3?1:0,B=n[y][2]>=3?1:0,vt=n[y][3]>=3?1:0,bt=n[y][0]>=2?1:0,Mt=n[y][1]>=2?1:0,yt=n[y][2]>=2?1:0,F=n[y][3]>=2?1:0,Z=n[y][0]>=1?1:0,z=n[y][1]>=1?1:0,Y=n[y][2]>=1?1:0,ee=n[y][3]>=1?1:0,Dt=c-G+h,wt=p-H+h,Rt=u-B+h,Ct=d-vt+h,At=c-bt+2*h,Nt=p-Mt+2*h,Ot=u-yt+2*h,kt=d-F+2*h,jt=c-Z+3*h,Lt=p-z+3*h,Ut=u-Y+3*h,It=d-ee+3*h,Ft=c-1+4*h,Zt=p-1+4*h,zt=u-1+4*h,Yt=d-1+4*h,it=k&255,st=j&255,ot=g&255,at=v&255,Le=r[it+r[st+r[ot+r[at]]]]%32,Ue=r[it+G+r[st+H+r[ot+B+r[at+vt]]]]%32,Ie=r[it+bt+r[st+Mt+r[ot+yt+r[at+F]]]]%32,Fe=r[it+Z+r[st+z+r[ot+Y+r[at+ee]]]]%32,Ze=r[it+1+r[st+1+r[ot+1+r[at+1]]]]%32,nt=.6-c*c-p*p-u*u-d*d;nt<0?D=0:(nt*=nt,D=nt*nt*this._dot4(o[Le],c,p,u,d));let rt=.6-Dt*Dt-wt*wt-Rt*Rt-Ct*Ct;rt<0?O=0:(rt*=rt,O=rt*rt*this._dot4(o[Ue],Dt,wt,Rt,Ct));let ht=.6-At*At-Nt*Nt-Ot*Ot-kt*kt;ht<0?L=0:(ht*=ht,L=ht*ht*this._dot4(o[Ie],At,Nt,Ot,kt));let lt=.6-jt*jt-Lt*Lt-Ut*Ut-It*It;lt<0?M=0:(lt*=lt,M=lt*lt*this._dot4(o[Fe],jt,Lt,Ut,It));let ct=.6-Ft*Ft-Zt*Zt-zt*zt-Yt*Yt;return ct<0?P=0:(ct*=ct,P=ct*ct*this._dot4(o[Ze],Ft,Zt,zt,Yt)),27*(D+O+L+M+P)}_dot(t,e,i){return t[0]*e+t[1]*i}_dot3(t,e,i,s){return t[0]*e+t[1]*i+t[2]*s}_dot4(t,e,i,s,o){return t[0]*e+t[1]*i+t[2]*s+t[3]*o}};var ft={name:"SSAOShader",defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:32},uniforms:{tNormal:{value:null},tDepth:{value:null},tNoise:{value:null},kernel:{value:null},cameraNear:{value:null},cameraFar:{value:null},resolution:{value:new _},cameraProjectionMatrix:{value:new Xt},cameraInverseProjectionMatrix:{value:new Xt},kernelRadius:{value:8},minDistance:{value:.005},maxDistance:{value:.05}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`
		uniform highp sampler2D tNormal;
		uniform highp sampler2D tDepth;
		uniform sampler2D tNoise;

		uniform vec3 kernel[ KERNEL_SIZE ];

		uniform vec2 resolution;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float kernelRadius;
		uniform float minDistance; // avoid artifacts caused by neighbour fragments with minimal depth difference
		uniform float maxDistance; // avoid the influence of fragments which are too far away

		varying vec2 vUv;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {

			return texture2D( tDepth, screenPosition ).x;

		}

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		float getViewZ( const in float depth ) {

			#if PERSPECTIVE_CAMERA == 1

				return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );

			#else

				return orthographicDepthToViewZ( depth, cameraNear, cameraFar );

			#endif

		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {

			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];

			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );

			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;

		}

		vec3 getViewNormal( const in vec2 screenPosition ) {

			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );

		}

		void main() {

			float depth = getDepth( vUv );

			if ( depth == 1.0 ) {

				gl_FragColor = vec4( 1.0 ); // don't influence background

			} else {

				float viewZ = getViewZ( depth );

				vec3 viewPosition = getViewPosition( vUv, depth, viewZ );
				vec3 viewNormal = getViewNormal( vUv );

				vec2 noiseScale = vec2( resolution.x / 4.0, resolution.y / 4.0 );
				vec3 random = vec3( texture2D( tNoise, vUv * noiseScale ).r );

				// compute matrix used to reorient a kernel vector

				vec3 tangent = normalize( random - viewNormal * dot( random, viewNormal ) );
				vec3 bitangent = cross( viewNormal, tangent );
				mat3 kernelMatrix = mat3( tangent, bitangent, viewNormal );

				float occlusion = 0.0;

				for ( int i = 0; i < KERNEL_SIZE; i ++ ) {

					vec3 sampleVector = kernelMatrix * kernel[ i ]; // reorient sample vector in view space
					vec3 samplePoint = viewPosition + ( sampleVector * kernelRadius ); // calculate sample point

					vec4 samplePointNDC = cameraProjectionMatrix * vec4( samplePoint, 1.0 ); // project point and calculate NDC
					samplePointNDC /= samplePointNDC.w;

					vec2 samplePointUv = samplePointNDC.xy * 0.5 + 0.5; // compute uv coordinates

					float realDepth = getLinearDepth( samplePointUv ); // get linear depth from depth texture
					float sampleDepth = viewZToOrthographicDepth( samplePoint.z, cameraNear, cameraFar ); // compute linear depth of the sample view Z value
					float delta = sampleDepth - realDepth;

					if ( delta > minDistance && delta < maxDistance ) { // if fragment is before sample point, increase occlusion

						occlusion += 1.0;

					}

				}

				occlusion = clamp( occlusion / float( KERNEL_SIZE ), 0.0, 1.0 );

				gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );

			}

		}`},mt={name:"SSAODepthShader",defines:{PERSPECTIVE_CAMERA:1},uniforms:{tDepth:{value:null},cameraNear:{value:null},cameraFar:{value:null}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;

		varying vec2 vUv;

		#include <packing>

		float getLinearDepth( const in vec2 screenPosition ) {

			#if PERSPECTIVE_CAMERA == 1

				float fragCoordZ = texture2D( tDepth, screenPosition ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );

			#else

				return texture2D( tDepth, screenPosition ).x;

			#endif

		}

		void main() {

			float depth = getLinearDepth( vUv );
			gl_FragColor = vec4( vec3( 1.0 - depth ), 1.0 );

		}`},_t={name:"SSAOBlurShader",uniforms:{tDiffuse:{value:null},resolution:{value:new _}},vertexShader:`varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`uniform sampler2D tDiffuse;

		uniform vec2 resolution;

		varying vec2 vUv;

		void main() {

			vec2 texelSize = ( 1.0 / resolution );
			float result = 0.0;

			for ( int i = - 2; i <= 2; i ++ ) {

				for ( int j = - 2; j <= 2; j ++ ) {

					vec2 offset = ( vec2( float( i ), float( j ) ) ) * texelSize;
					result += texture2D( tDiffuse, vUv + offset ).r;

				}

			}

			gl_FragColor = vec4( vec3( result / ( 5.0 * 5.0 ) ), 1.0 );

		}`};var te=class a extends N{constructor(t,e,i=512,s=512,o=32){super(),this.width=i,this.height=s,this.clear=!0,this.needsSwap=!1,this.camera=e,this.scene=t,this.kernelRadius=8,this.kernel=[],this.noiseTexture=null,this.output=0,this.minDistance=.005,this.maxDistance=.1,this._visibilityCache=[],this._generateSampleKernel(o),this._generateRandomKernelRotations();let n=new Se;n.format=fe,n.type=de,this.normalRenderTarget=new ut(this.width,this.height,{minFilter:Ht,magFilter:Ht,type:pt,depthTexture:n}),this.ssaoRenderTarget=new ut(this.width,this.height,{type:pt}),this.blurRenderTarget=this.ssaoRenderTarget.clone(),this.ssaoMaterial=new K({defines:Object.assign({},ft.defines),uniforms:I.clone(ft.uniforms),vertexShader:ft.vertexShader,fragmentShader:ft.fragmentShader,blending:U}),this.ssaoMaterial.defines.KERNEL_SIZE=o,this.ssaoMaterial.uniforms.tNormal.value=this.normalRenderTarget.texture,this.ssaoMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.ssaoMaterial.uniforms.tNoise.value=this.noiseTexture,this.ssaoMaterial.uniforms.kernel.value=this.kernel,this.ssaoMaterial.uniforms.cameraNear.value=this.camera.near,this.ssaoMaterial.uniforms.cameraFar.value=this.camera.far,this.ssaoMaterial.uniforms.resolution.value.set(this.width,this.height),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.normalMaterial=new xe,this.normalMaterial.blending=U,this.blurMaterial=new K({defines:Object.assign({},_t.defines),uniforms:I.clone(_t.uniforms),vertexShader:_t.vertexShader,fragmentShader:_t.fragmentShader}),this.blurMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.blurMaterial.uniforms.resolution.value.set(this.width,this.height),this.depthRenderMaterial=new K({defines:Object.assign({},mt.defines),uniforms:I.clone(mt.uniforms),vertexShader:mt.vertexShader,fragmentShader:mt.fragmentShader,blending:U}),this.depthRenderMaterial.uniforms.tDepth.value=this.normalRenderTarget.depthTexture,this.depthRenderMaterial.uniforms.cameraNear.value=this.camera.near,this.depthRenderMaterial.uniforms.cameraFar.value=this.camera.far,this.copyMaterial=new K({uniforms:I.clone(Q.uniforms),vertexShader:Q.vertexShader,fragmentShader:Q.fragmentShader,transparent:!0,depthTest:!1,depthWrite:!1,blendSrc:oe,blendDst:Vt,blendEquation:Kt,blendSrcAlpha:se,blendDstAlpha:Vt,blendEquationAlpha:Kt}),this._fsQuad=new V(null),this._originalClearColor=new be}dispose(){this.normalRenderTarget.dispose(),this.ssaoRenderTarget.dispose(),this.blurRenderTarget.dispose(),this.normalMaterial.dispose(),this.blurMaterial.dispose(),this.copyMaterial.dispose(),this.depthRenderMaterial.dispose(),this._fsQuad.dispose()}render(t,e,i){switch(this._overrideVisibility(),this._renderOverride(t,this.normalMaterial,this.normalRenderTarget,7829503,1),this._restoreVisibility(),this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius,this.ssaoMaterial.uniforms.minDistance.value=this.minDistance,this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance,this._renderPass(t,this.ssaoMaterial,this.ssaoRenderTarget),this._renderPass(t,this.blurMaterial,this.blurRenderTarget),this.output){case a.OUTPUT.SSAO:this.copyMaterial.uniforms.tDiffuse.value=this.ssaoRenderTarget.texture,this.copyMaterial.blending=U,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:i);break;case a.OUTPUT.Blur:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=U,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:i);break;case a.OUTPUT.Depth:this._renderPass(t,this.depthRenderMaterial,this.renderToScreen?null:i);break;case a.OUTPUT.Normal:this.copyMaterial.uniforms.tDiffuse.value=this.normalRenderTarget.texture,this.copyMaterial.blending=U,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:i);break;case a.OUTPUT.Default:this.copyMaterial.uniforms.tDiffuse.value=this.blurRenderTarget.texture,this.copyMaterial.blending=ie,this._renderPass(t,this.copyMaterial,this.renderToScreen?null:i);break;default:console.warn("THREE.SSAOPass: Unknown output type.")}}setSize(t,e){this.width=t,this.height=e,this.ssaoRenderTarget.setSize(t,e),this.normalRenderTarget.setSize(t,e),this.blurRenderTarget.setSize(t,e),this.ssaoMaterial.uniforms.resolution.value.set(t,e),this.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(this.camera.projectionMatrix),this.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(this.camera.projectionMatrixInverse),this.blurMaterial.uniforms.resolution.value.set(t,e)}_renderPass(t,e,i,s,o){t.getClearColor(this._originalClearColor);let n=t.getClearAlpha(),r=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s!=null&&(t.setClearColor(s),t.setClearAlpha(o||0),t.clear()),this._fsQuad.material=e,this._fsQuad.render(t),t.autoClear=r,t.setClearColor(this._originalClearColor),t.setClearAlpha(n)}_renderOverride(t,e,i,s,o){t.getClearColor(this._originalClearColor);let n=t.getClearAlpha(),r=t.autoClear;t.setRenderTarget(i),t.autoClear=!1,s=e.clearColor||s,o=e.clearAlpha||o,s!=null&&(t.setClearColor(s),t.setClearAlpha(o||0),t.clear()),this.scene.overrideMaterial=e,t.render(this.scene,this.camera),this.scene.overrideMaterial=null,t.autoClear=r,t.setClearColor(this._originalClearColor),t.setClearAlpha(n)}_generateSampleKernel(t){let e=this.kernel;for(let i=0;i<t;i++){let s=new R;s.x=Math.random()*2-1,s.y=Math.random()*2-1,s.z=Math.random(),s.normalize();let o=i/t;o=Pt.lerp(.1,1,o*o),s.multiplyScalar(o),e.push(s)}}_generateRandomKernelRotations(){let i=new xt,s=16,o=new Float32Array(s);for(let n=0;n<s;n++){let r=Math.random()*2-1,b=Math.random()*2-1,h=0;o[n]=i.noise3d(r,b,h)}this.noiseTexture=new Pe(o,4,4,me,ue),this.noiseTexture.wrapS=Gt,this.noiseTexture.wrapT=Gt,this.noiseTexture.needsUpdate=!0}_overrideVisibility(){let t=this.scene,e=this._visibilityCache;t.traverse(function(i){(i.isPoints||i.isLine||i.isLine2)&&i.visible&&(i.visible=!1,e.push(i))})}_restoreVisibility(){let t=this._visibilityCache;for(let e=0;e<t.length;e++)t[e].visible=!0;t.length=0}};te.OUTPUT={Default:0,SSAO:1,Blur:2,Depth:3,Normal:4};var gt={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var je=class extends N{constructor(){super(),this.uniforms=I.clone(gt.uniforms),this.material=new Ee({name:gt.name,uniforms:this.uniforms,vertexShader:gt.vertexShader,fragmentShader:gt.fragmentShader}),this._fsQuad=new V(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ge.getTransfer(this._outputColorSpace)===_e&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===ae?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===ne?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===re?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===he?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ce?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===pe?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===le&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this._fsQuad.render(t))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};export{Ne as a,N as b,ke as c,te as d,je as e};
