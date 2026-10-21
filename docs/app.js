import {catalog} from './routine-planner.mjs';
const fileInput=document.querySelector('#photo-input');
const chooseButton=document.querySelector('#choose-photo');
const consent=document.querySelector('#consent');
const analyzeButton=document.querySelector('#analyze-button');
const statusNode=document.querySelector('#status');
const dropzone=document.querySelector('#dropzone');
let selectedFile=null;
let objectUrl=null;
let isSyntheticSample=false;
let bagCount=0;
let latestScores=[];
let photoVersion=0;
let activeAnalysis=null;
const bag=new Map();
const products=new Map(catalog.map(product=>[product.name,product]));
const inr=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);

function updateReady(){analyzeButton.disabled=!(selectedFile&&consent.checked)||Boolean(activeAnalysis)}
function invalidateAnalysis(){
  photoVersion++;activeAnalysis?.abort();activeAnalysis=null;consent.checked=false;latestScores=[];
  document.querySelector('#results').classList.add('hidden');document.querySelector('#overall-score').textContent='—';document.querySelector('#overall-bar').style.width='0';document.querySelector('#signals-list').replaceChildren();
  analyzeButton.innerHTML='View recorded check-in <span>→</span>';updateFocus('simple');window.dispatchEvent(new CustomEvent('goodskin:clear'));
}
async function setFile(file){
  if(!file)return;
  invalidateAnalysis();const selectionVersion=photoVersion;selectedFile=null;isSyntheticSample=false;updateReady();let preparedFile;
  const allowed=['image/jpeg','image/png','image/webp'];
  const rejectFile=message=>{if(selectionVersion!==photoVersion)return;invalidateAnalysis();selectedFile=null;isSyntheticSample=false;fileInput.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;document.querySelector('#preview-image').removeAttribute('src');document.querySelector('#upload-preview').classList.add('hidden');document.querySelector('#upload-empty').classList.remove('hidden');showStatus(message,true);updateReady()};
  if(!allowed.includes(file.type)){rejectFile('Please choose a JPG, PNG, or WebP image.');return}
  if(file.size>10*1024*1024){rejectFile('That image is over 10 MB. Choose a smaller one and try again.');return}
  try{
    const bitmap=await createImageBitmap(file);
    const shortSide=Math.min(bitmap.width,bitmap.height);
    if(shortSide<480){bitmap.close();rejectFile('Choose a photo at least 480 pixels wide and tall for a clear analysis.');return}
    const scale=Math.min(1,2560/Math.max(bitmap.width,bitmap.height));
    if(scale<1||file.type==='image/webp'){
      const canvas=document.createElement('canvas');
      canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
      const context=canvas.getContext('2d');
      if(!context){bitmap.close();rejectFile('This photo could not be prepared. Try a JPG or PNG image.');return}
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));
      if(!blob){rejectFile('This photo could not be prepared. Try a JPG or PNG image.');return}
      preparedFile=new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
    }else{bitmap.close();preparedFile=file}
  }catch{rejectFile('This photo could not be opened. Try a JPG or PNG image.');return}
  if(selectionVersion!==photoVersion)return;selectedFile=preparedFile;if(objectUrl)URL.revokeObjectURL(objectUrl);
  isSyntheticSample=file.name==='synthetic-sample.png';
  objectUrl=URL.createObjectURL(file);
  document.querySelector('#preview-image').src=objectUrl;
  document.querySelector('#photo-name').textContent=isSyntheticSample?'Synthetic sample · AI-generated':file.name;
  document.querySelector('#upload-empty').classList.add('hidden');
  document.querySelector('#upload-preview').classList.remove('hidden');
  showStatus('');updateReady();
}
function showStatus(message,error=false){statusNode.textContent=message;statusNode.classList.toggle('error',error)}
chooseButton.addEventListener('click',()=>fileInput.click());
document.querySelector('#sample-photo').addEventListener('click',async()=>{
  const button=document.querySelector('#sample-photo');button.disabled=true;button.textContent='Loading sample…';
  try{const response=await fetch('./public/synthetic-sample.png');if(!response.ok)throw new Error();await setFile(new File([await response.blob()],'synthetic-sample.png',{type:'image/png'}))}
  catch{showStatus('The synthetic sample could not be loaded. Choose a photo instead.',true)}
  finally{button.disabled=false;button.textContent='Load the synthetic sample'}
});
fileInput.addEventListener('change',()=>setFile(fileInput.files[0]));
document.querySelector('#remove-photo').addEventListener('click',()=>{
  invalidateAnalysis();
  selectedFile=null;fileInput.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;
  isSyntheticSample=false;
  document.querySelector('#preview-image').removeAttribute('src');
  document.querySelector('#upload-preview').classList.add('hidden');document.querySelector('#upload-empty').classList.remove('hidden');
  showStatus('');updateReady();
});
consent.addEventListener('change',updateReady);
for(const eventName of ['dragenter','dragover'])dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.add('dragging')});
for(const eventName of ['dragleave','drop'])dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.remove('dragging')});
dropzone.addEventListener('drop',event=>{event.preventDefault();showStatus('Personal photo uploads are unavailable in this recorded-example explorer.');});

function collectScores(data){
  const results=data?.results?.output||data?.results||data?.output;
  if(Array.isArray(results))return results.map(item=>({name:item.type||item.name||'Skin signal',score:Number(item.ui_score??item.score)})).filter(x=>Number.isFinite(x.score));
  const scoreInfo=data?.score_info||data?.results?.score_info||results||data;
  const scores=[];
  const visit=(name,value)=>{
    if(!value||typeof value!=='object')return;
    if('ui_score'in value||'score'in value){const score=Number(value.ui_score??value.score);if(Number.isFinite(score))scores.push({name:name.replace(/^hd_/,'').replaceAll('_',' '),score});return}
    for(const [key,child] of Object.entries(value))if(key!=='all'&&key!=='skin_age')visit(name?`${name} ${key}`:key,child);
  };
  visit('',scoreInfo);
  return scores;
}
function showResults(data){
  const scores=collectScores(data);
  latestScores=scores;
  const overallSignal=scores.find(item=>['all','overall','overall score'].includes(item.name.toLowerCase()));
  const overall=Number(data?.results?.all?.score??data?.results?.output?.all?.score??data?.score_info?.all?.score??data?.all?.score??data?.overall_score??overallSignal?.score);
  if(Number.isFinite(overall)){document.querySelector('#overall-score').textContent=Math.round(overall);document.querySelector('#overall-bar').style.width=`${Math.max(0,Math.min(100,overall))}%`}
  else {document.querySelector('#overall-score').textContent='—';document.querySelector('#overall-bar').style.width='0'}
  const pretty=name=>name.split(' ').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
  const signalContainer=document.querySelector('#signals-list');signalContainer.replaceChildren();
  const preferred=['acne','redness','moisture','texture','pore','oiliness','radiance'];
  const visible=scores.filter(item=>!['all','overall','overall score','skin_age'].includes(item.name.toLowerCase())).sort((a,b)=>{const ai=preferred.indexOf(a.name.toLowerCase()),bi=preferred.indexOf(b.name.toLowerCase());return(ai<0?99:ai)-(bi<0?99:bi)}).slice(0,6);
  for(const signal of visible){const item=document.createElement('div');item.className='signal';const label=document.createElement('span');label.textContent=pretty(signal.name);const value=document.createElement('strong');value.textContent=`${Math.round(signal.score)}`;item.append(label,value);signalContainer.append(item)}
  if(!visible.length){const empty=document.createElement('p');empty.className='signal-empty';empty.textContent='YouCam did not return individual skin signals for this photo.';signalContainer.append(empty)}
  const overallDescription=document.querySelector('#overall-description');if(overallDescription)overallDescription.textContent=Number.isFinite(overall)?'Recorded YouCam overall score from the synthetic-sample run on 21 October 2026. This is not a new analysis.':'YouCam returned individual signals without an overall score for this check-in.';
  document.querySelector('#results .result-live').innerHTML='<i></i> RECORDED EXAMPLE';
  document.querySelector('#results').classList.remove('hidden');document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
  updateFocus('simple');
}
// Normalized transcription of the visible live-run result, not a raw API payload.
// All values are shown in the captured competition video and published screenshot.
const recordedExample={overall_score:79,results:{output:[{type:'acne',score:82},{type:'redness',score:99},{type:'moisture',score:72},{type:'texture',score:79},{type:'pore',score:65}]}};
analyzeButton.addEventListener('click',()=>{if(!selectedFile||!consent.checked)return;showResults(recordedExample);showStatus('Recorded values loaded from the 21 October 2026 run. No photo was uploaded and no live API request was made.');});

const focusPlans={
  simple:{title:'Your starting point: keep what you own.',body:'Use the planner below to identify missing steps and fit the new items to your budget. The sample catalog is a shopping sandbox, not a treatment plan.',signal:[]},
  comfort:{title:'Your question: what feels comfortable?',body:'Use your texture preference and budget to compare demo moisturizers in the planner. The related signal is context about this photo, not a product suitability claim.',signal:['moisture']},
  texture:{title:'Your question: how can I keep this simple?',body:'Use the planner to retain existing products and avoid duplicate steps. A photo score cannot tell which product will suit you.',signal:['texture']},
  sun:{title:'Your question: what is missing from my daytime routine?',body:'Review what you already own and your budget in the planner. A skin score is not needed to explore daytime protection.',signal:[]}
};
function updateFocus(key){
  const plan=focusPlans[key]||focusPlans.simple;
  document.querySelectorAll('.focus-option').forEach(button=>{const active=button.dataset.focus===key;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active))});
  const matchingSignal=plan.signal.length?latestScores.find(item=>plan.signal.some(name=>item.name.toLowerCase().includes(name))):null;
  const result=document.querySelector('#focus-result');result.replaceChildren();
  const title=document.createElement('strong');title.textContent=plan.title;const body=document.createElement('span');body.textContent=plan.body;result.append(title,body);
  if(plan.signal.length){const context=document.createElement('span');context.className='focus-signal';context.textContent=matchingSignal?`Recorded YouCam signal from 21 October 2026: ${matchingSignal.name} ${Math.round(matchingSignal.score)}/100. The number is shown as returned; it does not tell you what to buy.`:'No matching YouCam signal was returned for this photo. Your preference still guides this edit.';result.append(context)}
  document.querySelectorAll('.routine-card').forEach(card=>{card.classList.remove('focus-match');card.querySelector('.focus-match-label')?.remove()});
  document.querySelector('#routine-intro').textContent='Three examples from the seven-item sample catalog. The planner compares eligible items using your preferences and prices.';
  window.dispatchEvent(new CustomEvent('goodskin:focus',{detail:{label:document.querySelector('.focus-option.selected')?.textContent.trim()||'Keep it simple',signal:matchingSignal?`${matchingSignal.name} ${Math.round(matchingSignal.score)}/100`:null,hasAnalysis:latestScores.length>0}}));
}
document.querySelectorAll('.focus-option').forEach(button=>button.addEventListener('click',()=>updateFocus(button.dataset.focus)));
document.querySelector('#clear-checkin').addEventListener('click',()=>{
  invalidateAnalysis();
  selectedFile=null;isSyntheticSample=false;fileInput.value='';consent.checked=false;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;
  document.querySelector('#preview-image').removeAttribute('src');document.querySelector('#upload-preview').classList.add('hidden');document.querySelector('#upload-empty').classList.remove('hidden');
  showStatus('Your photo and check-in results were cleared from this page.');updateReady();document.querySelector('#check-in').scrollIntoView({behavior:'smooth',block:'start'});
});

function renderBag(){
  const list=document.querySelector('#bag-items');list.replaceChildren();let subtotal=0;bagCount=0;
  if(!bag.size){const empty=document.createElement('p');empty.className='bag-empty';empty.textContent='Your bag is empty for now.';list.append(empty)}
  for(const [name,quantity] of bag){const product=products.get(name);if(!product)continue;subtotal+=product.price*quantity;bagCount+=quantity;const row=document.createElement('div');row.className='bag-item';const details=document.createElement('div');const title=document.createElement('strong');title.textContent=name;const count=document.createElement('span');count.textContent=`Qty ${quantity}`;const controls=document.createElement('div');controls.className='bag-item-controls';for(const [label,delta] of [['Remove one',-1],['Add one',1]]){const button=document.createElement('button');button.type='button';button.textContent=delta<0?'−':'+';button.setAttribute('aria-label',`${label} ${name}`);button.addEventListener('click',()=>{const next=(bag.get(name)||0)+delta;if(next<=0)bag.delete(name);else bag.set(name,Math.min(99,next));renderBag()});controls.append(button)}details.append(title,count,controls);const price=document.createElement('strong');price.textContent=inr(product.price*quantity);row.append(details,price);list.append(row)}
  document.querySelector('#bag-count').textContent=bagCount;document.querySelector('.bag-button').setAttribute('aria-label',`Shopping bag, ${bagCount} items`);document.querySelector('#bag-subtotal').textContent=inr(subtotal);
  window.dispatchEvent(new CustomEvent('goodskin:bag',{detail:{ids:[...bag.keys()].map(name=>products.get(name)?.id).filter(Boolean)}}));
}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.add;bag.set(name,(bag.get(name)||0)+1);renderBag();
  const toast=document.querySelector('#cart-toast');toast.querySelector('span').textContent='✓';toast.classList.remove('hidden');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.add('hidden'),2200);
}));
window.addEventListener('goodskin:add-plan',event=>{
  if(!Array.isArray(event.detail?.ids))return;
  for(const id of new Set(event.detail.ids)){const product=catalog.find(item=>item.id===id);if(product)bag.set(product.name,Math.min(99,(bag.get(product.name)||0)+1))}
  renderBag();bagDialog.showModal();
});
const bagDialog=document.querySelector('#bag-dialog');
document.querySelector('#bag-button').addEventListener('click',()=>bagDialog.showModal());
document.querySelector('#close-bag').addEventListener('click',()=>bagDialog.close());
bagDialog.addEventListener('click',event=>{if(event.target===bagDialog)bagDialog.close()});
