// Illustrative catalog for the hackathon. Prices and attributes are sample data,
// not claims about real products or clinical suitability.
export const catalog = [
  {id:'simple-wash',name:'Simple Start Wash',step:'cleanse',price:349,finish:'rinse-off',fragranceFree:true},
  {id:'soft-start',name:'Soft Start Cleanser',step:'cleanse',price:499,finish:'rinse-off',fragranceFree:true},
  {id:'everyday-lotion',name:'Everyday Lotion',step:'moisturize',price:399,finish:'light',fragranceFree:false},
  {id:'light-comfort',name:'Light Comfort Gel',step:'moisturize',price:449,finish:'light',fragranceFree:true},
  {id:'daily-comfort',name:'Daily Comfort Cream',step:'moisturize',price:899,finish:'rich',fragranceFree:true},
  {id:'everyday-spf',name:'Everyday SPF 30',step:'protect',price:699,finish:'light',fragranceFree:true},
  {id:'soft-shade',name:'Soft Shade SPF 50',step:'protect',price:949,finish:'rich',fragranceFree:true}
];
export const steps = [
  {id:'cleanse',label:'Cleanser'},
  {id:'moisturize',label:'Moisturizer'},
  {id:'protect',label:'Daytime sunscreen'}
];

export function buildRoutine({budget=1500,owned=[],finish='any',fragranceFree=true}={}) {
  if(typeof budget!=='number'||!Number.isFinite(budget)||budget<0||budget>100000)throw new RangeError('Enter a budget between ₹0 and ₹100,000.');
  if(!['any','light','rich'].includes(finish))throw new RangeError('Choose a valid moisturizer texture.');
  const retained=new Set(Array.isArray(owned)?owned:[]);
  const lines=steps.map(step=>{
    if(retained.has(step.id))return {...step,owned:true,product:null,cost:0,alternatives:[]};
    const options=catalog.filter(p=>p.step===step.id&&(!fragranceFree||p.fragranceFree)&&(step.id!=='moisturize'||finish==='any'||p.finish===finish)).sort((a,b)=>a.price-b.price||a.id.localeCompare(b.id));
    if(!options.length)return {...step,owned:false,product:null,cost:0,alternatives:[],unavailable:true};
    return {...step,owned:false,product:options[0],cost:options[0].price,alternatives:options.slice(1)};
  });
  const total=lines.reduce((sum,line)=>sum+line.cost,0);
  const missingChoice=lines.some(line=>line.unavailable);
  return {budget,finish,fragranceFree,lines,total,remaining:Math.max(0,budget-total),shortfall:Math.max(0,total-budget),feasible:!missingChoice&&total<=budget,ownedCount:lines.filter(line=>line.owned).length,additions:lines.flatMap(line=>line.product?[line.product]:[])};
}

export function routineReceipt(plan,{focus='Keep it simple',signal=null}={}) {
  return ['GOODSKIN — RECORDED-EXAMPLE ROUTINE EDIT','',`Your focus: ${focus}`,signal?`Recorded YouCam context: ${signal}. This cosmetic signal did not select products.`:'No YouCam signal included. This edit uses your shopping preferences.',`Budget for new items: ₹${plan.budget}`,`Illustrative new-item total: ₹${plan.total}`,plan.feasible?`Within budget; ₹${plan.remaining} remains.`:`Over budget by ₹${plan.shortfall}; no items were added.`, '',...plan.lines.map(line=>`${line.label}: ${line.owned?'Keep what I already own (₹0 new spend)':line.product?`${line.product.name} — ₹${line.cost}`:'No matching sample item'}`),'','How this edit was made: retain owned steps, apply your catalog preferences, then minimize the cost of missing steps.','All names, prices, and product attributes are illustrative sample data. No checkout. Cosmetic context only.','This file contains no photo, API key, task ID, or personal profile.'].join('\n');
}

export function missingAdditions(plan,inBag=[]) {
  const present=new Set(inBag);
  return plan.additions.filter(product=>!present.has(product.id));
}
