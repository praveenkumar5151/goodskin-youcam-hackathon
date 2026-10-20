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
const bag=new Map();
const products=new Map([
  ['Soft Start Cleanser',{price:499}],
  ['Daily Comfort Cream',{price:899}],
  ['Everyday SPF 30',{price:699}]
]);
const inr=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value);

function updateReady(){analyzeButton.disabled=!(selectedFile&&consent.checked)}
async function setFile(file){
  if(!file)return;
  const allowed=['image/jpeg','image/png','image/webp'];
  const rejectFile=message=>{selectedFile=null;isSyntheticSample=false;fileInput.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;document.querySelector('#preview-image').removeAttribute('src');document.querySelector('#upload-preview').classList.add('hidden');document.querySelector('#upload-empty').classList.remove('hidden');showStatus(message,true);updateReady()};
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
      selectedFile=new File([blob],file.name.replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'});
    }else{bitmap.close();selectedFile=file}
  }catch{rejectFile('This photo could not be opened. Try a JPG or PNG image.');return}
  if(objectUrl)URL.revokeObjectURL(objectUrl);
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
  try{const response=await fetch('/public/synthetic-sample.png');if(!response.ok)throw new Error();await setFile(new File([await response.blob()],'synthetic-sample.png',{type:'image/png'}))}
  catch{showStatus('The synthetic sample could not be loaded. Choose a photo instead.',true)}
  finally{button.disabled=false;button.textContent='Try a synthetic sample'}
});
fileInput.addEventListener('change',()=>setFile(fileInput.files[0]));
document.querySelector('#remove-photo').addEventListener('click',()=>{
  selectedFile=null;fileInput.value='';if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;
  isSyntheticSample=false;
  document.querySelector('#preview-image').removeAttribute('src');
  document.querySelector('#upload-preview').classList.add('hidden');document.querySelector('#upload-empty').classList.remove('hidden');
  showStatus('');updateReady();
});
consent.addEventListener('change',updateReady);
for(const eventName of ['dragenter','dragover'])dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.add('dragging')});
for(const eventName of ['dragleave','drop'])dropzone.addEventListener(eventName,event=>{event.preventDefault();dropzone.classList.remove('dragging')});
dropzone.addEventListener('drop',event=>setFile(event.dataTransfer.files[0]));

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
  const overall=Number(data?.results?.all?.score??data?.score_info?.all?.score??data?.all?.score??data?.overall_score);
  if(Number.isFinite(overall)){document.querySelector('#overall-score').textContent=Math.round(overall);document.querySelector('#overall-bar').style.width=`${Math.max(0,Math.min(100,overall))}%`}
  else {document.querySelector('#overall-score').textContent='—';document.querySelector('#overall-bar').style.width='0'}
  const pretty=name=>name.split(' ').map(word=>word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
  const signalContainer=document.querySelector('#signals-list');signalContainer.replaceChildren();
  const preferred=['acne','redness','moisture','texture','pore','oiliness','radiance'];
  const visible=scores.sort((a,b)=>{const ai=preferred.indexOf(a.name.toLowerCase()),bi=preferred.indexOf(b.name.toLowerCase());return(ai<0?99:ai)-(bi<0?99:bi)}).slice(0,6);
  for(const signal of visible){const item=document.createElement('div');item.className='signal';const label=document.createElement('span');label.textContent=pretty(signal.name);const value=document.createElement('strong');value.textContent=`${Math.round(signal.score)}`;item.append(label,value);signalContainer.append(item)}
  if(!visible.length){const empty=document.createElement('p');empty.className='signal-empty';empty.textContent='YouCam did not return individual skin signals for this photo.';signalContainer.append(empty)}
  const overallDescription=document.querySelector('#overall-description');if(overallDescription)overallDescription.textContent=Number.isFinite(overall)?'YouCam’s overall score for visible skin patterns in this photo. It can vary with lighting and the photo you choose.':'YouCam returned individual signals without an overall score for this check-in.';
  document.querySelector('#results .result-live').innerHTML='<i></i> ANALYSIS COMPLETE';
  document.querySelector('#results').classList.remove('hidden');document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'});
}
analyzeButton.addEventListener('click',async()=>{
  if(!selectedFile||!consent.checked)return;
  analyzeButton.disabled=true;analyzeButton.innerHTML='<span>Reading your check-in…</span><span>◌</span>';showStatus(isSyntheticSample?'Sending the synthetic sample to YouCam for analysis. This can take a little while.':'Preparing your photo securely. This can take a little while.');
  try{
    const body=new FormData();body.append('photo',selectedFile);
    const response=await fetch('/api/analyze',{method:'POST',body,signal:AbortSignal.timeout(210_000)});
    const payload=await response.json();
    if(!response.ok)throw new Error(payload.error||'The check-in could not be completed. Please try again.');
    showStatus('Your check-in is ready.');showResults(payload);
  }catch(error){showStatus(error.message||'Something went wrong. Please try again.',true)}
  finally{analyzeButton.innerHTML='Start my check-in <span>→</span>';updateReady()}
});

function renderBag(){
  const list=document.querySelector('#bag-items');list.replaceChildren();let subtotal=0;bagCount=0;
  if(!bag.size){const empty=document.createElement('p');empty.className='bag-empty';empty.textContent='Your bag is empty for now.';list.append(empty)}
  for(const [name,quantity] of bag){const product=products.get(name);if(!product)continue;subtotal+=product.price*quantity;bagCount+=quantity;const row=document.createElement('div');row.className='bag-item';const details=document.createElement('div');const title=document.createElement('strong');title.textContent=name;const count=document.createElement('span');count.textContent=`Qty ${quantity}`;details.append(title,count);const price=document.createElement('strong');price.textContent=inr(product.price*quantity);row.append(details,price);list.append(row)}
  document.querySelector('#bag-count').textContent=bagCount;document.querySelector('.bag-button').setAttribute('aria-label',`Shopping bag, ${bagCount} items`);document.querySelector('#bag-subtotal').textContent=inr(subtotal);
}
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.add;bag.set(name,(bag.get(name)||0)+1);renderBag();
  const toast=document.querySelector('#cart-toast');toast.querySelector('span').textContent='✓';toast.classList.remove('hidden');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.add('hidden'),2200);
}));
const bagDialog=document.querySelector('#bag-dialog');
document.querySelector('#bag-button').addEventListener('click',()=>bagDialog.showModal());
document.querySelector('#close-bag').addEventListener('click',()=>bagDialog.close());
bagDialog.addEventListener('click',event=>{if(event.target===bagDialog)bagDialog.close()});
