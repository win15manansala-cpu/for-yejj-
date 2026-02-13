document.addEventListener('DOMContentLoaded',function(){
  var isFile=location.protocol==='file:';
  function h2rgb(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);return [r,g,b];}
  function avgEdge(imgData,w,h){var d=imgData.data,step=4,acc=[0,0,0],n=0,i,x,y;
    for(x=0;x<w;x++){i=(x+h*0)*step;acc[0]+=d[i];acc[1]+=d[i+1];acc[2]+=d[i+2];n++;
      y=h-1;i=((y*w)+x)*step;acc[0]+=d[i];acc[1]+=d[i+1];acc[2]+=d[i+2];n++;}
    for(y=0;y<h;y++){x=0;i=((y*w)+x)*step;acc[0]+=d[i];acc[1]+=d[i+1];acc[2]+=d[i+2];n++;
      x=w-1;i=((y*w)+x)*step;acc[0]+=d[i];acc[1]+=d[i+1];acc[2]+=d[i+2];n++;}
    return [acc[0]/n,acc[1]/n,acc[2]/n];
  }
  function replaceBackgroundGradient(img,topHex,bottomHex){
    var c=document.createElement('canvas'),ctx=c.getContext('2d');
    c.width=img.naturalWidth;c.height=img.naturalHeight;ctx.drawImage(img,0,0);
    var data=ctx.getImageData(0,0,c.width,c.height),d=data.data,w=c.width,h=c.height;
    var e=avgEdge(data,w,h),t0=h2rgb(topHex),t1=h2rgb(bottomHex),thr=40;
    var m=new Float32Array(w*h),idx=0;
    for(var y=0;y<h;y++){for(var x=0;x<w;x++){var i=idx*4;
      var dr=d[i]-e[0],dg=d[i+1]-e[1],db=d[i+2]-e[2];
      var dist=Math.sqrt(dr*dr+dg*dg+db*db);
      var v=dist<thr?1:0;m[idx]=v;idx++;}}
    var m2=new Float32Array(w*h);
    for(var y=0;y<h;y++){for(var x=0;x<w;x++){
      var s=0,ct=0;
      for(var oy=-1;oy<=1;oy++){for(var ox=-1;ox<=1;ox++){
        var nx=x+ox,ny=y+oy;if(nx<0||ny<0||nx>=w||ny>=h)continue;
        s+=m[ny*w+nx];ct++;}}
      m2[y*w+x]=s/ct;
    }}
    idx=0;
    for(var y=0;y<h;y++){var f=y/(h-1);var gr=Math.round(t0[0]*(1-f)+t1[0]*f),gg=Math.round(t0[1]*(1-f)+t1[1]*f),gb=Math.round(t0[2]*(1-f)+t1[2]*f);
      for(var x=0;x<w;x++){var i=idx*4;var a=m2[idx];
      if(a>0){
        var k=a;
        var n=(Math.random()*2-1)*2*k;
        d[i]=Math.max(0,Math.min(255,Math.round(d[i]*(1-k)+(gr+n)*k)));
        d[i+1]=Math.max(0,Math.min(255,Math.round(d[i+1]*(1-k)+(gg+n)*k)));
        d[i+2]=Math.max(0,Math.min(255,Math.round(d[i+2]*(1-k)+(gb+n)*k)));
      }
      idx++;}}
    ctx.putImageData(data,0,0);
    var fmt='image/jpeg';
    if((img.currentSrc||img.src).toLowerCase().includes('webp')) fmt='image/webp';
    try{var url=c.toDataURL(fmt,0.92);img.src=url;}catch(e){}
  }
  var imgs=document.querySelectorAll('img.lazy');
  (function(){
    var viewer=document.getElementById('viewer'); if(!viewer) return;
    var wrap=viewer.querySelector('.viewer'); var vimg=viewer.querySelector('.viewer-img');
    var loader=viewer.querySelector('.viewer-loader');
    var prev=viewer.querySelector('.viewer-btn.prev'); var next=viewer.querySelector('.viewer-btn.next'); var close=viewer.querySelector('.viewer-close');
    var list=Array.prototype.slice.call(document.querySelectorAll('.gallery-item img')); var idx=0; var scale=1; var panX=0; var panY=0; var open=false;
    function setTransform(){ vimg.style.transform='translate('+panX+'px,'+panY+'px) scale('+scale+')'; }
    function resetTransform(){ scale=1; panX=0; panY=0; setTransform(); vimg.classList.remove('zoomed'); }
    function fillMeta(){ /* right panel removed; noop */ }
    function load(i){
      idx=(i+list.length)%list.length; wrap.dataset.index=idx; loader.style.display='grid'; vimg.style.opacity='0'; resetTransform();
      var src=list[idx].getAttribute('data-src')||list[idx].src;
      vimg.src=''; vimg.alt=list[idx].alt||'';
      var im=new Image(); im.loading='eager'; im.decoding='async'; im.src=src;
      im.onload=function(){ vimg.src=src; fillMeta(); loader.style.display='none'; wrap.classList.add('loaded'); vimg.style.opacity='1'; };
      im.onerror=function(){ loader.style.display='none'; vimg.src=''; };
    }
    function openViewer(i){ open=true; viewer.classList.add('open'); load(i); viewer.focus(); }
    function closeViewer(){ open=false; viewer.classList.remove('open'); vimg.src=''; resetTransform(); }
    list.forEach(function(img,i){ img.style.cursor='zoom-in'; img.addEventListener('click',function(){ openViewer(i); }); });
    close.addEventListener('click',function(){ closeViewer(); });
    viewer.addEventListener('click',function(e){ if(e.target===viewer) closeViewer(); });
    prev.addEventListener('click',function(){ load(idx-1); });
    next.addEventListener('click',function(){ load(idx+1); });
    viewer.addEventListener('keydown',function(e){
      if(!open) return;
      if(e.key==='Escape') closeViewer();
      else if(e.key==='ArrowLeft') load(idx-1);
      else if(e.key==='ArrowRight') load(idx+1);
      else if(e.key==='+'||e.key==='='||e.key==='Minus'||e.key==='_'||e.key==='0'){ }
    });
    vimg.addEventListener('dblclick',function(){ if(scale===1){ scale=2; vimg.classList.add('zoomed'); } else { scale=1; vimg.classList.remove('zoomed'); panX=0; panY=0; } setTransform(); });
    vimg.addEventListener('wheel',function(e){ e.preventDefault(); var s=scale+(e.deltaY>0?-0.2:0.2); scale=Math.max(1,Math.min(5,s)); if(scale===1){ panX=0; panY=0; vimg.classList.remove('zoomed'); } else vimg.classList.add('zoomed'); setTransform(); },{passive:false});
    var dragging=false,sx=0,sy=0;
    vimg.addEventListener('mousedown',function(e){ if(scale<=1) return; dragging=true; sx=e.clientX; sy=e.clientY; });
    window.addEventListener('mouseup',function(){ dragging=false; });
    window.addEventListener('mousemove',function(e){ if(!dragging) return; panX+=e.clientX-sx; panY+=e.clientY-sy; sx=e.clientX; sy=e.clientY; setTransform(); });
  })();
  (function(){
    var toggle=document.querySelector('.nav-toggle'); var drawer=document.getElementById('nav-drawer');
    if(!toggle||!drawer) return;
    function open(){ drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); toggle.setAttribute('aria-expanded','true'); }
    function close(){ drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-expanded','false'); }
    toggle.addEventListener('click',function(){ if(drawer.classList.contains('open')) close(); else open(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
    drawer.addEventListener('click',function(e){ if(e.target===drawer) close(); });
  })();
  if(isFile){
    imgs.forEach(function(img){
      var fig=img.closest('.gallery-item'); if(fig) fig.classList.add('loading');
      var start=performance.now(),minDelay=600;
      function done(){ var elapsed=performance.now()-start,wait=Math.max(0,minDelay-elapsed);
        setTimeout(function(){
          img.classList.add('loaded');
          if(fig){ fig.classList.remove('loading'); fig.classList.add('loaded'); }
        },wait);
      }
      if(img.complete && img.naturalWidth>0){ done(); }
      else{
        img.addEventListener('load', done, { once:true });
        img.addEventListener('error', function(){ if(fig){ fig.classList.remove('loading'); fig.classList.add('error'); } }, { once:true });
      }
    });
    return;
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          var img=entry.target, full=img.getAttribute('data-src');
          if(full){
            var loader=new Image();
            loader.crossOrigin='anonymous';
            loader.src=full;
            var fig=img.closest('.gallery-item'); if(fig) fig.classList.add('loading');
            var start=performance.now(),minDelay=600;
            loader.onload=function(){
              var elapsed=performance.now()-start,wait=Math.max(0,minDelay-elapsed);
              setTimeout(function(){
                img.src=full; img.classList.add('loaded');
                replaceBackgroundGradient(loader,'#FFB6C1','#FFC0CB');
                img.src=loader.src;
                if(fig){ fig.classList.remove('loading'); fig.classList.add('loaded'); }
              },wait);
            };
            loader.onerror=function(){
              if(fig){ fig.classList.remove('loading'); fig.classList.add('error'); }
            };
            io.unobserve(img);
          }
        }
      });
    },{rootMargin:'200px'});
    imgs.forEach(function(i){ io.observe(i); });
  } else {
    imgs.forEach(function(img){
      var full=img.getAttribute('data-src');
      if(full){
        var loader=new Image();
        loader.crossOrigin='anonymous';
        loader.src=full;
        var fig=img.closest('.gallery-item'); if(fig) fig.classList.add('loading');
        var start=performance.now(),minDelay=600;
        loader.onload=function(){
          var elapsed=performance.now()-start,wait=Math.max(0,minDelay-elapsed);
          setTimeout(function(){
            img.src=full; img.classList.add('loaded');
            replaceBackgroundGradient(loader,'#FFB6C1','#FFC0CB');
            img.src=loader.src;
            if(fig){ fig.classList.remove('loading'); fig.classList.add('loaded'); }
          },wait);
        };
        loader.onerror=function(){
          if(fig){ fig.classList.remove('loading'); fig.classList.add('error'); }
        };
      }
    });
  }
});
