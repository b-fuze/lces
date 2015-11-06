lces.rc[1] = function() {
  window.qsmoothp = function(f){var d=this;d.qsmoth={pro:0};d.qsmooth=function(a){if(void 0==a.pro){var c=a.n,b=a.n1,g=(b-c)*(void 0!=a.speed&&"number"==typeof a.speed?a.speed:.1),h=g+c;a.func(h);d.qsmoth.pro+=1;var k=d.qsmoth.pro;d.timeOut=setTimeout(function(){d.qsmooth({func:a.func,n:c,n1:b,pro:k,cur:h,off:g,end:a.end,endarg:a.endarg,noRound:a.noRound,checkIncr:a.checkIncr})},33)}else{if(a.pro!=d.qsmoth.pro)return!1;if (a.n!=a.n1) {var stop=false;var c=a.n,b=a.n1,f=a.off,l=-1*a.checkIncr,l=b<c?l:a.checkIncr,m=!1,n=!1,e=f*(1-(a.cur- c)/(b-c))+a.cur;b<c?l+e<=a.n1&&(m=!0):l+e>=a.n1&&(m=!0);b<c?e<=a.n1&&(n=!0):e>=a.n1&&(n=!0);} else var stop=true;if(stop||!a.noRound&&Math.round(e)==b||e==b||n||void 0!=a.checkIncr&&"number"==typeof a.checkIncr&&m)a.func((stop?a.n1:b)),"function"==typeof a.end&&(arguments=void 0!=a.endarg?a.endarg:void 0,a.end(arguments));else{if(isNaN(a.cur))return!1;a.func(e);d.timeOut=setTimeout(function(){d.qsmooth({func:a.func,pro:a.pro,cur:e,off:f,n:c,n1:b,end:a.end,endarg:a.endarg,noRound:a.noRound,checkIncr:a.checkIncr})},38)}}};this.timeOut=null; this.qsmooth(f)};window.qsFadein=function(f,d,a,c,b,g,h,k){return new qsmoothp({func:f,n:d,n1:a,off:g?g:.2,speed:c?c:.032,noRound:void 0!=h?h:!0,checkIncr:void 0!=k?k:.001,end:void 0!=b?b:void 0})};
  window.clearQS = function(qs) {
    if (qs&&qs.qsmoth)
      qs.qsmoth.pro = 0;
  }
}
