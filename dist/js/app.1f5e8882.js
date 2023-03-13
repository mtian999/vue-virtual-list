(function(){"use strict";var t={8896:function(t,e,i){var n=i(6369),a=function(){var t=this,e=t._self._c;return e("div",{attrs:{id:"app"}},[e("input",{staticStyle:{position:"absolute","z-index":"1"},attrs:{type:"text"},on:{input:t.changeHandle}}),e("BaseVirtualList",t._g(t._b({ref:"refBaseVirtualList",attrs:{realData:t.listData,isUnfreeze:!0},scopedSlots:t._u([{key:"default",fn:function({item:i}){return[e("div",{staticClass:"list-item",style:{backgroundColor:i.color},on:{click:function(e){return t.clickHandle(i)}}},[t._v(" "+t._s(i.content)+" ")])]}}])},"BaseVirtualList",t.$attrs,!1),t.$listeners))],1)},s=[],r=(i(7658),function(){var t=this,e=t._self._c;return e("div",{staticClass:"container",style:t.containerStyle},[e("div",{ref:"virtualList",staticClass:"virtual-list-container",on:{scroll:function(e){return e.preventDefault(),t.virtualScroll.apply(null,arguments)}}},[e("div",{staticClass:"virtual-list-box",style:t.virtualBoxStyle},[e("div",{staticClass:"content",style:t.virtualStyle},t._l(t.renderList,(function(i){return e("item",{key:i[t.keyName],staticClass:"content-item",attrs:{data:i,"fixed-height":!1,index:i.index},on:{itemMounted:t.itemMountedHandle,itemSizeChange:t.itemSizeChangeHandle,itemSizeChangeEnd:t.itemSizeChangeEndHandle,itemDestroyed:t.itemDestroyedHandle,delDestroyedList:t.delDestroyedListHandle}},[t._t("default",null,{item:i})],2)})),1)]),t._t("virtualListExtra")],2),e("div",{staticClass:"destroyed-but-need-show"},[t.dataRowHeader?[t._t("default",null,{item:t.dataRowHeader})]:t._e()],2),e("div",{staticClass:"preview-item"},[t.headPreviewItem?[e("item",{key:t.headPreviewItem.key,ref:"refHeadPreviewItem",attrs:{data:t.headPreviewItem},on:{itemSizeChange:t.headPreviewItemSizeChangeHandle,itemMounted:t.headPreviewItemMountedHandle}},[t._t("default",null,{item:t.headPreviewItem})],2)]:t._e()],2)])}),o=[],l=i(4806),h=function(){var t=this,e=t._self._c;return e("div",{ref:"item",staticClass:"item"},[t._t("default")],2)},d=[],c=i(566),f={name:"BaseVirtualListItem",props:{index:{type:Number,default:0},data:{type:Object,default:()=>({})}},data(){return{initItemHeight:0}},destroyed(){this.$emit("itemDestroyed",this.data)},created(){this.itemSizeChangeEndHandle=(0,l.debounce)(this.itemSizeChangeEndHandle,50,{leading:!1,trailing:!0})},mounted(){this.initItemHeight=this.$refs.item.offsetHeight;const t=new c.Z((()=>{const t=this.$refs.item.offsetHeight;t!==this.initItemHeight&&this.itemSizeChangeEndHandle({itemData:this.data,itemHeight:t}),this.itemSizeChangeHandle({itemData:this.data,itemHeight:t})}));t.observe(this.$refs.item),this.$once("hook:beforeDestroy",t.disconnect.bind(t)),"dataRow"===this.data.type&&this.$emit("delDestroyedList",this.data);const e=this.initItemHeight;this.$emit("itemMounted",{itemData:this.data,itemHeight:e})},methods:{itemSizeChangeHandle({itemData:t,itemHeight:e}){this.$emit("itemSizeChange",{itemData:t,itemHeight:e})},itemSizeChangeEndHandle({itemData:t,itemHeight:e}){this.initItemHeight=e,this.$emit("itemSizeChangeEnd",{itemData:t,itemHeight:e})}}},u=f,g=i(3736),m=(0,g.Z)(u,h,d,!1,null,"733d83c4",null),p=m.exports;const H=100,I=0,_=2,y=_+1;let v={advanced:66,dataRow:85,dataRowItem:40,select:0,text:66,group:46};function D(t,e){const i=e.split(".");let n=t;for(let a=0;a<i.length;a++)if(n=n[i[a]],void 0===n)break;return n}function w(t){const e=t.lastIndexOf(".");return-1===e?[t,""]:[t.substr(0,e),t.substr(e+1)]}const z=function(t,e){const i=t.length;let n=0,a=i-1,s=null;while(n<=a){let i=n+a>>1;const r=t[i]._nodeInfo._topNum+t[i]._nodeInfo._height;let o=r;if(o===e)return i;o<e?n=i+1:((null===s||s>i)&&(s=i),a--)}return s};var S={name:"BaseVirtualList",components:{Item:p},props:{realData:{type:Array,default(){return[]}},keyName:{type:String,default:"key"},isUnfreeze:{type:Boolean,default:!0},freezeKeyName:{type:[String,Array]},virtualListHeight:{type:[Number,String]}},data(){return{currentRealData:[],screenHeight:0,preItemHeight:50,totalHeight:0,virtualStyle:{},scrollTopVal:0,renderList:[],renderStartNode:{index:0,scrollOffset:0},headPreviewItem:null,destroyedData:{},showKey:"",waitFrozenList:[],isHasWaitFrozenList:new WeakMap,isFreezing:!1,waitScrollOffsetData:{offsetScroll:0,isScrollToTarget:!1},isSizeChange:!1,isUpdatingHeadPreviewItem:!1,isUpdatingRealHeight:!1,waitUpdateItemMinIdx:0,isAmendScrollTop:!1}},computed:{realDataLen(){return this.realData.length},containerStyle(){let t=this.virtualListHeight;return t?("[object Number]"===Object.prototype.toString.call(t)&&(t+="px"),{height:t}):{height:"100%"}},virtualBoxStyle(){return{minHeight:`${this.totalHeight}px`}},dataRowHeader(){let t;return this.showKey&&(t=this.destroyedData[this.showKey]),t}},watch:{"renderStartNode.index":{handler(t){let e;this.headPreviewItem=null;const i=t,n=this.currentRealData[i-1];n&&(e={...n},e._nodeInfo={...n._nodeInfo}),this.headPreviewItem=e}},dataRowHeader(t){t&&(this.waitScrollOffsetData=Object.assign({},this.waitScrollOffsetData,{offsetScroll:-1*t._nodeInfo._height}))},waitScrollOffsetData(t){this.$nextTick((()=>{if(t.isScrollToTarget&&t.offsetScroll){const e=t.offsetScroll;void 0!==e&&this.offsetScrollHandle(e),this.waitScrollOffsetData.isScrollToTarget=!1}}))},realData:{handler(){this.initRender()}}},created(){this.itemSizeChangeEndHandle=(0,l.debounce)(this.itemSizeChangeEndHandle,50,{leading:!1,trailing:!0}),this.debounceFrozenDataProcessByCompatible=(0,l.throttle)(this.frozenDataProcessByCompatible,5e3,{leading:!1})},mounted(){this.initRender(),window.bv=this},methods:{initRender(){this.renderList=[],this.initCurrentRealDataAndRealHeight(),this.$nextTick((()=>{this.getRenderList()}))},addDestroyedListHandle(t){this.$set(this.destroyedData,t.key,t)},delDestroyedListHandle(t){this.$delete(this.destroyedData,t.key)},setDestroyedListShowOrderHandle(t){"dataRowItem"===t.type&&(this.showKey=t.rowDataKey)},headPreviewItemMountedHandle({itemData:t,itemHeight:e}){if(!1===this.isUpdatingHeadPreviewItem){this.isUpdatingHeadPreviewItem=!0;const i=this.currentRealData[t.index];!i||i._nodeInfo._height===e&&!0!==i._nodeInfo._isInitialHeight||(i._nodeInfo._height=e,i._nodeInfo._isInitialHeight=!1,this.waitUpdateItemMinIdx>i.index&&(this.waitUpdateItemMinIdx=i.index)),this.waitUpdateItemMinIdx<this.realDataLen&&this.updateRealHeight(),this.isUpdatingHeadPreviewItem=!1}},headPreviewItemSizeChangeHandle({itemData:t,itemHeight:e}){const i=this.currentRealData[t.index];i._nodeInfo._height===e&&!0!==i._nodeInfo._isInitialHeight||(i._nodeInfo._height=e,i._nodeInfo._isInitialHeight=!1,this.waitUpdateItemMinIdx>t.index&&(this.waitUpdateItemMinIdx=t.index))},itemMountedHandle(){this.itemSizeChangeEndHandle()},itemSizeChangeEndHandle(){v=Object.assign({},v,this.getAverageCompPreHeight(this.currentRealData)),this.updateRealHeight()},itemSizeChangeHandle({itemData:t,itemHeight:e}){t._nodeInfo._height===e&&!0!==t._nodeInfo._isInitialHeight||(this.isSizeChange=!0,t._nodeInfo._height=e,t._nodeInfo._isInitialHeight=!1,this.waitUpdateItemMinIdx>t.index&&(this.waitUpdateItemMinIdx=t.index))},itemDestroyedHandle(t){if(!this.isUnfreeze&&!this.freezeKeyName)return;const e=t,i=this.isHasWaitFrozenList.has(e);i||(this.waitFrozenList.push(e),this.isHasWaitFrozenList.set(e)),this.frozenDataHandle()},frozenDataHandle(){this.isFreezing||(this.isFreezing=!0,window.requestIdleCallback?requestIdleCallback(this.frozenDataProcess):this.debounceFrozenDataProcessByCompatible())},frozenDataProcess(t){this.isFreezing=!1;while(t.timeRemaining()>30&&this.waitFrozenList.length>I){const t=this.waitFrozenList.shift();this.isHasWaitFrozenList.delete(t),this.isUnfreeze&&this.freezeHandle(this.currentRealData,t,this.freezeKeyName)}this.waitFrozenList.length>I&&this.frozenDataHandle()},frozenDataProcessByCompatible(){this.isFreezing=!1;while(this.waitFrozenList.length>I){const t=this.waitFrozenList.shift(),e=Object.isFrozen(t.children);!1===e&&(t.children=Object.freeze((0,l.cloneDeep)(t.children)))}},virtualScroll(t){const e=t.target.scrollTop-this.scrollTopVal;this.scrollTopVal+=e,!1===this.isAmendScrollTop&&this.getRenderList(),this.isAmendScrollTop=!1},initCurrentRealDataAndRealHeight(){let t=0;for(let e=0;e<this.realDataLen;e++){const i={...this.realData[e]};void 0===i._nodeInfo&&(i._nodeInfo={}),i.index=e,i._nodeInfo._topNum=t,void 0===i._nodeInfo._height&&(i._nodeInfo._height=v[i.type]||this.preItemHeight,i._nodeInfo._isInitialHeight=!0),t+=i._nodeInfo._height,this.isUnfreeze?this.currentRealData[e]=i:this.currentRealData[e]=Object.freeze(i)}this.totalHeight=t},updateRealHeight(){const t=this.realDataLen;if(this.waitUpdateItemMinIdx===t)return;const e=this.waitUpdateItemMinIdx;this.waitUpdateItemMinIdx=t;const i=e;if(this.isUpdatingRealHeight)return;this.isUpdatingRealHeight=!0;let n=0;const a=t,s=this.currentRealData[this.renderStartNode.index]._nodeInfo._height;for(let l=i;l<a;l++){const t=this.currentRealData[l],e=this.currentRealData[l-1];if(!0===t._nodeInfo._isInitialHeight){const e=v[t.type]||this.preItemHeight;t._nodeInfo._height!==e&&(t._nodeInfo._height=e)}t._nodeInfo._topNum=e?e._nodeInfo._topNum+e._nodeInfo._height:0,n=t._nodeInfo._topNum+t._nodeInfo._height}this.totalHeight=n;const r=this.currentRealData[this.renderStartNode.index]?._nodeInfo._topNum+this.renderStartNode.scrollOffset;let o=this.$refs.virtualList;console.log("sizeChange",e,this.renderStartNode.index,s),o&&o.scrollTop!==r?(this.isAmendScrollTop=!0,this.$nextTick((()=>{this.$refs.virtualList.scrollTop=r,this.virtualStyle={transform:`translate3d(0, ${this.currentRealData[this.renderStartNode.index]?._nodeInfo._topNum}px, 0)`}}))):this.getRenderList(),o=null,this.isUpdatingRealHeight=!1},findCenterIndex(t,e){let i=0;return i=z(e,t)||0,0===i&&t>e[e.length-1]?._nodeInfo._topNum&&(i=e.length-1>=0?e.length-1:0),i},offsetScrollHandle(t){t&&(this.$refs.virtualList.scrollTop=this.$refs.virtualList.scrollTop+t)},scrollToTargetHandle(t){this.updateRealHeight();const e=this.currentRealData.find((e=>e.index===t));e&&this.scrollToIndex(e)},scrollToIndex(t){this.$refs.virtualList.scrollTop=t._nodeInfo._topNum,this.scrollTopVal=t._nodeInfo._topNum,this.waitScrollOffsetData=Object.assign({},this.waitScrollOffsetData,{isScrollToTarget:!0})},getRenderList(){const t=this.scrollTopVal;let e=this.findCenterIndex(t,this.currentRealData)-_;e<0&&(e=0);const i=this.currentRealData[e]?._nodeInfo._topNum||0;if(this.renderStartNode={index:e,scrollOffset:t-i},e===this.renderList?.[0]?.index&&!1===this.isSizeChange)return;this.isSizeChange=!1,this.virtualStyle={transform:`translate3d(0, ${i}px, 0)`};const n=H;let a=e+n;a=Math.min(a,this.realDataLen);let s=0,r=0,o=!1;const l=[];0===this.screenHeight&&(this.screenHeight=this.$refs.virtualList.offsetHeight);for(let d=e;d<a;d++){const t=this.currentRealData[d],e=this.currentRealData[d+1],i=t._nodeInfo._height,n=e?._nodeInfo._height||0;if(i<1.5*this.screenHeight&&(s+=i),i>r&&(r=i),n>r&&(r=n),!(s<1.5*this.screenHeight))break;this.isUnfreeze&&this.unfreezeHandle(this.currentRealData,t,this.freezeKeyName),l.push(t),s+n>1.5*this.screenHeight&&(o||(o=!0,s-=r))}if(e===this.renderList?.[0]?.index&&this.renderList.length===l.length)return;if(l){const t=l.find((t=>"dataRowItem"===t.type));if(t){let e=l.find((e=>e.key===t.rowDataKey));void 0===e&&void 0===this.destroyedData[t.rowDataKey]&&(e=this.currentRealData.find((e=>e.key===t.rowDataKey)),e&&this.$set(this.destroyedData,t.rowDataKey,e)),this.setDestroyedListShowOrderHandle(t)}else this.destroyedData={}}const h=l[l.length-1];if(h){const t=h.index,e=t+1;for(let i=e;i<e+y;i++){const t=this.currentRealData[i];t&&l.push(t)}}this.renderList=l},unfreezeHandle(t,e,i){let n=[];i?(n=n.concat(i),n.forEach((t=>{const i=D(e,t);if(i){const n=Object.isFrozen(i);if(!0===n){const[n,a]=w(t);let s=i;s=Array.isArray(i)?[...i]:{...i},""===a?e[n]=s:D(e,n)[a]=s}}}))):Object.isFrozen(e)&&(t[e.index]={...e})},freezeHandle(t,e,i){let n=[];i?(n=n.concat(i),n.forEach((i=>{const n=D(e,i);if(n){const a=Object.isFrozen(n);if(!1===a){const[t,a]=w(i),s=Object.freeze((0,l.cloneDeep)(n));""===a?e[t]=s:D(e,t)[a]=s}t[e.index]={...e}}}))):t[e.index]=(0,l.cloneDeep)(e)},getAverageCompPreHeight(t){const e={},i={};for(let n=0;n<t.length;n++){const i=t[n];void 0===e[i.type]&&(e[i.type]={totalHeight:0,count:0}),!1===i._nodeInfo._isInitialHeight&&(e[i.type].totalHeight+=i._nodeInfo._height,e[i.type].count+=1)}return Object.keys(e).forEach((t=>{const{totalHeight:n,count:a}=e[t];a>0&&(i[t]=Math.floor(n/a))})),i}}},x=S,b=(0,g.Z)(x,r,o,!1,null,"5ee47b12",null),L=b.exports;function R(t){for(var e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",i="",n=0;n<t;n++)i+=e.charAt(parseInt(Math.random()*e.length));return i}function C(t,e){const i=Math.floor(Math.random()*(t-e+1))+e;return i}function O(){const t=Math.floor(255*Math.random()),e=Math.floor(255*Math.random()),i=Math.floor(255*Math.random());return"rgba("+t+","+e+","+i+",0.8)"}function T(){const t=[];for(let e=0;e<1e4;e++){const i=R(C(500,50));t.push({key:e,content:i,color:O(),type:"div"})}return Object.freeze(t)}var k={name:"App",components:{BaseVirtualList:L},data(){return{listData:[]}},mounted(){setTimeout((()=>{this.listData=T()}),500)},methods:{clickHandle(t){t.content=R(C(500,50)),t.color=O()},changeHandle(t){const e=parseInt(t.target.value);isNaN(e)||(console.log(e),this.$refs.refBaseVirtualList.scrollToTargetHandle(e))}}},M=k,N=(0,g.Z)(M,a,s,!1,null,null,null),P=N.exports;n.ZP.config.productionTip=!1,new n.ZP({render:t=>t(P)}).$mount("#app")}},e={};function i(n){var a=e[n];if(void 0!==a)return a.exports;var s=e[n]={id:n,loaded:!1,exports:{}};return t[n].call(s.exports,s,s.exports,i),s.loaded=!0,s.exports}i.m=t,function(){var t=[];i.O=function(e,n,a,s){if(!n){var r=1/0;for(d=0;d<t.length;d++){n=t[d][0],a=t[d][1],s=t[d][2];for(var o=!0,l=0;l<n.length;l++)(!1&s||r>=s)&&Object.keys(i.O).every((function(t){return i.O[t](n[l])}))?n.splice(l--,1):(o=!1,s<r&&(r=s));if(o){t.splice(d--,1);var h=a();void 0!==h&&(e=h)}}return e}s=s||0;for(var d=t.length;d>0&&t[d-1][2]>s;d--)t[d]=t[d-1];t[d]=[n,a,s]}}(),function(){i.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return i.d(e,{a:e}),e}}(),function(){i.d=function(t,e){for(var n in e)i.o(e,n)&&!i.o(t,n)&&Object.defineProperty(t,n,{enumerable:!0,get:e[n]})}}(),function(){i.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"===typeof window)return window}}()}(),function(){i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)}}(),function(){i.nmd=function(t){return t.paths=[],t.children||(t.children=[]),t}}(),function(){var t={143:0};i.O.j=function(e){return 0===t[e]};var e=function(e,n){var a,s,r=n[0],o=n[1],l=n[2],h=0;if(r.some((function(e){return 0!==t[e]}))){for(a in o)i.o(o,a)&&(i.m[a]=o[a]);if(l)var d=l(i)}for(e&&e(n);h<r.length;h++)s=r[h],i.o(t,s)&&t[s]&&t[s][0](),t[s]=0;return i.O(d)},n=self["webpackChunkvue_virtual_list"]=self["webpackChunkvue_virtual_list"]||[];n.forEach(e.bind(null,0)),n.push=e.bind(null,n.push.bind(n))}();var n=i.O(void 0,[998],(function(){return i(8896)}));n=i.O(n)})();
//# sourceMappingURL=app.1f5e8882.js.map