import test from 'node:test';
import assert from 'node:assert/strict';
import {buildRoutine,catalog,routineReceipt,missingAdditions} from '../routine-planner.mjs';

test('finds the least expensive combination that satisfies all constraints',()=>{
  for(const finish of ['any','light','rich'])for(const fragranceFree of [true,false]){
    const plan=buildRoutine({budget:5000,finish,fragranceFree});
    const combinations=[];
    for(const cleanser of catalog.filter(p=>p.step==='cleanse'))for(const cream of catalog.filter(p=>p.step==='moisturize'))for(const spf of catalog.filter(p=>p.step==='protect')){
      const items=[cleanser,cream,spf];
      if(fragranceFree&&items.some(p=>!p.fragranceFree))continue;
      if(finish!=='any'&&cream.finish!==finish)continue;
      combinations.push(items.reduce((sum,p)=>sum+p.price,0));
    }
    assert.equal(plan.total,Math.min(...combinations));assert.equal(plan.feasible,true);
  }
});
test('reuses any subset of owned steps and never charges for them',()=>{
  const all=['cleanse','moisturize','protect'];
  for(let mask=0;mask<8;mask++){
    const owned=all.filter((_,i)=>mask&(1<<i));const plan=buildRoutine({budget:5000,owned});
    assert.equal(plan.ownedCount,owned.length);assert.equal(plan.additions.length,3-owned.length);
    for(const step of owned){const line=plan.lines.find(l=>l.id===step);assert.equal(line.cost,0);assert.equal(line.product,null)}
    assert.equal(plan.total,plan.additions.reduce((sum,p)=>sum+p.price,0));
  }
});
test('budget boundaries permit an exact fit and reject an overspend',()=>{
  const total=buildRoutine().total;
  assert.equal(buildRoutine({budget:total}).feasible,true);
  const over=buildRoutine({budget:total-1});assert.equal(over.feasible,false);assert.equal(over.shortfall,1);assert.equal(over.remaining,0);
});
test('all owned steps fit a zero budget without duplicate additions',()=>{
  const plan=buildRoutine({budget:0,owned:['cleanse','moisturize','protect']});assert.equal(plan.total,0);assert.equal(plan.feasible,true);assert.deepEqual(plan.additions,[]);
});
test('invalid budgets and invalid texture choices fail explicitly',()=>{
  for(const budget of [NaN,Infinity,-1,100001,'1500',null])assert.throws(()=>buildRoutine({budget}),RangeError);
  assert.throws(()=>buildRoutine({finish:'medical'}),RangeError);
});
test('a hypothetical image signal cannot change the planner selection',()=>{
  const before=buildRoutine({budget:1500});const after=buildRoutine({budget:1500,skinScore:0,acne:3});assert.deepEqual(before,after);
});
test('receipt includes budget status and explains the limits of sample data',()=>{
  const receipt=routineReceipt(buildRoutine({budget:100}),{focus:'Comfort & hydration',signal:'Moisture 72/100'});
  assert.match(receipt,/Over budget/);assert.match(receipt,/Moisture 72\/100/);assert.match(receipt,/illustrative sample data/);assert.match(receipt,/no photo, API key, task ID/);
});
test('adding a plan skips products already in the bag and allows re-adding a removed product',()=>{
  const plan=buildRoutine({owned:['cleanse']});const ids=plan.additions.map(p=>p.id);
  assert.deepEqual(missingAdditions(plan,ids),[]);
  assert.deepEqual(missingAdditions(plan,ids.slice(1)).map(p=>p.id),[ids[0]]);
});
