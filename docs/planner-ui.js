import {buildRoutine,routineReceipt,missingAdditions} from './routine-planner.mjs';
const form=document.querySelector('#planner-form');
const output=document.querySelector('#planner-output');
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);
let plan=null,focus='Keep it simple',signal=null,hasAnalysis=false,bagIds=[];
function node(tag,text,cls){const element=document.createElement(tag);if(text!==undefined)element.textContent=text;if(cls)element.className=cls;return element}
function render(){
  const budgetInput=form.elements.budget;
  output.replaceChildren();
  if(!budgetInput.checkValidity()||budgetInput.value.trim()===''){output.append(node('p','Enter a budget from ₹0 to ₹100,000 to build your edit.','planner-error'));plan=null;return}
  try{plan=buildRoutine({budget:Number(budgetInput.value),owned:[...form.querySelectorAll('[name=owned]:checked')].map(e=>e.value),finish:form.elements.finish.value,fragranceFree:form.elements.fragranceFree.checked})}catch(error){output.append(node('p',error.message,'planner-error'));plan=null;return}
  const summary=node('div',undefined,'planner-summary');
  const amount=node('div');amount.append(node('span','NEW DEMO ITEMS','planner-kicker'),node('strong',money(plan.total),'planner-total'));
  const status=node('div');status.append(node('strong',plan.feasible?(plan.additions.length?'Your edit fits.':'Keep your current routine.'):`This edit needs ${money(plan.shortfall)} more.`),node('p',`${plan.ownedCount} of 3 steps already owned. ${plan.feasible?`${money(plan.remaining)} left in your new-item budget.`:'The cheapest matching combination exceeds this budget. Adjust your preferences or what you already own; the app will not add an over-budget plan.'}`));
  summary.append(amount,status);output.append(summary);
  const context=node('p',signal?`${focus} · Recorded YouCam context: ${signal}. Your preferences and budget select the demo items; this signal does not.`:`${focus} · ${hasAnalysis?'Your check-in is complete. No focus-specific signal is used for this edit.':'This edit uses your budget and preferences. Complete a skin check-in to bring returned YouCam context into view.'}`,'planner-context');output.append(context);
  const grid=node('div',undefined,'planner-lines');
  for(const line of plan.lines){
    const card=node('article',undefined,`planner-line ${line.owned?'is-owned':''}`);
    card.append(node('span',line.label.toUpperCase(),'planner-kicker'),node('h3',line.owned?'Keep what you own':line.product?.name||'No matching sample'),node('strong',line.owned?'₹0 new spend':money(line.cost),'planner-price'));
    if(line.owned)card.append(node('p','You marked this step as already covered. There is no duplicate item to buy.'));
    else {
      const details=[];
      if(plan.fragranceFree)details.push('Matches your fragrance-free filter');
      if(line.id==='moisturize'&&plan.finish!=='any')details.push(`Matches your ${plan.finish==='light'?'lightweight':'rich'} texture choice`);
      details.push('Lowest price among matching sample items');
      const reasons=node('ul');for(const detail of details)reasons.append(node('li',detail));card.append(reasons);
      if(line.alternatives.length){const comparison=node('details');comparison.append(node('summary',`Compare ${line.alternatives.length} matching alternative${line.alternatives.length>1?'s':''}`));for(const alt of line.alternatives)comparison.append(node('p',`${alt.name} · ${money(alt.price)} · +${money(alt.price-line.cost)} versus this item`));card.append(comparison)}
    }
    grid.append(card);
  }
  output.append(grid);
  const controls=node('div',undefined,'planner-actions');
  const pending=missingAdditions(plan,bagIds);
  const add=node('button',!plan.additions.length?'No new items needed':!pending.length?'Your missing steps are in the bag':'Add only the missing steps','button button-dark');add.type='button';add.disabled=!plan.feasible||!pending.length;
  add.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('goodskin:add-plan',{detail:{ids:pending.map(p=>p.id)}})));
  const receipt=node('button','Download my decision card','quiet-button');receipt.type='button';receipt.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([routineReceipt(plan,{focus,signal})],{type:'text/plain;charset=utf-8'}));const link=node('a');link.href=url;link.download='goodskin-my-edit.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
  controls.append(add,receipt);output.append(controls);
}
form.addEventListener('input',render);form.addEventListener('change',render);form.addEventListener('submit',event=>{event.preventDefault();render()});
window.addEventListener('goodskin:focus',event=>{focus=event.detail.label;signal=event.detail.signal||null;hasAnalysis=event.detail.hasAnalysis;render()});
window.addEventListener('goodskin:clear',()=>{focus='Keep it simple';signal=null;hasAnalysis=false;render()});
window.addEventListener('goodskin:bag',event=>{bagIds=event.detail.ids;render()});
render();
