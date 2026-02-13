(function(){
  var bar=document.getElementById('progress');
  if(!bar) return;
  function up(){
    var st=window.scrollY||document.documentElement.scrollTop;
    var h=document.documentElement.scrollHeight - window.innerHeight;
    var p=Math.max(0,Math.min(100,(st/h)*100));
    bar.style.width=p+'%';
  }
  window.addEventListener('scroll',up,{passive:true}); up();
})();
