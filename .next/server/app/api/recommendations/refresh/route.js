(()=>{var a={};a.id=762,a.ids=[762],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4573:a=>{"use strict";a.exports=require("node:buffer")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},26849:a=>{"use strict";a.exports=require("@prisma/client/runtime/client")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33683:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{Y9:()=>l,j2:()=>m});var e=c(89353),f=c(23168),g=c(99306),h=c(7028),i=c(27143),j=c(85635),k=a([i]);i=(k.then?(await k)():k)[0];let{handlers:l,auth:m,signIn:n,signOut:o}=(0,e.Ay)({...j.f,adapter:(0,f.y)(i.db),session:{strategy:"jwt"},providers:[(0,g.A)({credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(a){if(!a?.email||!a?.password)return null;let b=await i.db.user.findUnique({where:{email:a.email}});return b&&b.password&&await h.Ay.compare(a.password,b.password)?{id:b.id,email:b.email,name:b.name,role:b.role}:null}})],callbacks:{jwt:({token:a,user:b})=>(b&&(a.id=b.id,a.role=b.role),a),session:({session:a,token:b})=>(a.user.id=b.id,a.user.role=b.role,a)}});d()}catch(a){d(a)}})},42842:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.d(b,{v:()=>i});var e=c(45685),f=c(27143),g=c(52026),h=a([f]);f=(h.then?(await h)():h)[0];let j=new e.Ay({apiKey:process.env.ANTHROPIC_API_KEY});async function i(a){let b,c=await f.db.userProfile.findUnique({where:{userId:a},include:{primarySkills:!0}});if(!c)throw Error("Profile not found for user "+a);let d=await f.db.macroSignal.findMany({orderBy:{scrapedAt:"desc"},take:200}),e=[...c.currentIndustry?[c.currentIndustry]:[],...c.targetIndustries??[]],h=[...c.currentRole?[c.currentRole]:[],...c.targetRoles??[]],i=[...c.primarySkills.map(a=>a.name),...c.learningSkills??[],...c.desiredSkills??[]],k=d.map(a=>({signal:a,score:function(a,b,c,d){let e=0,f=a=>a.toLowerCase(),g=b.map(f),h=c.map(f),i=d.map(f);for(let b of a.relevantIndustries)g.some(a=>a.includes(f(b))||f(b).includes(a))&&(e+=3);for(let b of a.relevantRoles)h.some(a=>a.includes(f(b))||f(b).includes(a))&&(e+=2);for(let b of a.relevantSkills)i.some(a=>a.includes(f(b))||f(b).includes(a))&&(e+=1);e+=a.magnitude;let j=(Date.now()-a.scrapedAt.getTime())/864e5;return j<7?e+=2:j<30&&(e+=1),e}(a,e,h,i)})).sort((a,b)=>b.score-a.score).slice(0,50).map(a=>a.signal),l=(0,g.g)(c,k),m=await j.messages.create({model:"claude-sonnet-4-6",max_tokens:4096,messages:[{role:"user",content:l}]}),n=m.content.filter(a=>"text"===a.type).map(a=>a.text).join(""),o=n.replace(/^```(?:json)?\n?/m,"").replace(/\n?```$/m,"").trim();try{b=JSON.parse(o)}catch{throw Error("Claude returned invalid JSON:\n"+n.slice(0,500))}return await f.db.careerRecommendation.updateMany({where:{userId:a,isLatest:!0},data:{isLatest:!1}}),(await f.db.careerRecommendation.create({data:{userId:a,isLatest:!0,inputTokens:m.usage.input_tokens,outputTokens:m.usage.output_tokens,skillsToAccelerate:b.skillsToAccelerate,skillsToDeprioritize:b.skillsToDeprioritize,skillsToWatch:b.skillsToWatch,rolesToTarget:b.rolesToTarget,rolesToAvoid:b.rolesToAvoid,industriesToMoveToward:b.industriesToMoveToward,industriesToAvoid:b.industriesToAvoid,keyNarrativeToTell:b.keyNarrativeToTell,incomeTrajectoryAssessment:b.incomeTrajectoryAssessment,biggestRisks:b.biggestRisks,biggestOpportunities:b.biggestOpportunities,signals:{connect:k.map(a=>({id:a.id}))}}})).id}d()}catch(a){d(a)}})},44865:a=>{"use strict";a.exports=import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},52026:(a,b,c)=>{"use strict";function d(a){return`You are a labor market intelligence analyst. Analyze the following raw content scraped from a job market or economic source and extract structured signal data.

RAW CONTENT:
${a}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "category": "JOB_MARKET" | "CAPITAL_FLOWS" | "SKILL_DEMAND" | "DISPLACEMENT_RISK" | "POLICY",
  "topic": "snake_case_topic_identifier",
  "headline": "One punchy sentence summarizing the signal",
  "dataPoint": "2-4 sentences with specific numbers, percentages, or named companies. Be concrete.",
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "magnitude": 1 | 2 | 3,
  "relevantIndustries": ["Industry1", "Industry2"],
  "relevantRoles": ["Role1", "Role2"],
  "relevantSkills": ["Skill1", "Skill2"]
}

Magnitude guide: 1=minor trend, 2=significant shift, 3=structural change.
Always include specific company names, numbers, and percentages when available.`}function e(a,b){let c=a.primarySkills.map(a=>`${a.name} (level ${a.proficiencyLevel}/5, ${a.yearsUsed??"?"} yrs)`).join(", "),d=[a.currentCompensation?`Current: $${a.currentCompensation.toLocaleString()}`:null,a.incomeGoal?`Goal: $${a.incomeGoal.toLocaleString()}`:null].filter(Boolean).join(" | "),e=b.map((a,b)=>`[Signal ${b+1}] ${a.category} | ${a.sentiment} | magnitude ${a.magnitude}
Headline: ${a.headline}
Data: ${a.dataPoint}
Relevant to: industries=${a.relevantIndustries.join(",")} roles=${a.relevantRoles.join(",")} skills=${a.relevantSkills.join(",")}`).join("\n\n");return`You are a senior career strategist and labor economist. Your job is to give brutally honest, specific, actionable career advice — not generic platitudes.

You have access to ${b.length} recent macro signals and a detailed user profile. Generate a comprehensive career recommendation report.

━━━ USER PROFILE ━━━
Current role: ${a.currentRole??"Not specified"}
Industry: ${a.currentIndustry??"Not specified"}
Experience: ${a.yearsOfExperience??"?"} years
Location: ${a.currentLocation??"Not specified"}

Skills: ${c||"None listed"}
Learning: ${a.learningSkills?.join(", ")||"None"}
Desired: ${a.desiredSkills?.join(", ")||"None"}

Target roles: ${a.targetRoles?.join(", ")||"Not specified"}
Target industries: ${a.targetIndustries?.join(", ")||"Not specified"}
Time horizon: ${a.targetTimeHorizon??"Not specified"}
${d?`Income: ${d}`:""}

Risk tolerance: ${a.riskTolerance??"?"}/5
Autonomy vs prestige: ${a.autonomyVsStatus??"?"}/5 (5=autonomy-driven)
Ambiguity tolerance: ${a.ambiguityTolerance??"?"}/5
Geographic flexibility: ${a.geographicFlexibility??"Not specified"}
Work environment: ${a.workEnvironmentPreference??"Not specified"}
Visa status: ${a.visaStatus??"Not specified"}
Hours/week for learning: ${a.hoursPerWeekForLearning??"?"}/week
Learning style: ${a.preferredLearningStyle??"Not specified"}
Family constraints: ${a.familyConstraints?"Yes":"No"}

━━━ MACRO SIGNALS (${b.length} total) ━━━
${e}

━━━ YOUR TASK ━━━
Synthesize the user's profile with these signals to produce a personalized career recommendation. Be opinionated. Name specific companies, skills, roles. Tie every recommendation back to specific signals. Never hedge — say "Do X" not "You might consider X."

${a.incomeGoal?`The user's income goal of $${a.incomeGoal.toLocaleString()} must thread through ALL advice — every section should connect back to this target.`:""}

Return ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "skillsToAccelerate": [
    { "skill": "Skill name", "reason": "2-3 sentences tied to specific signals", "urgency": "now" | "6mo" | "1yr" }
  ],
  "skillsToDeprioritize": [
    { "skill": "Skill name", "reason": "Why this skill is declining in value based on signals" }
  ],
  "skillsToWatch": [
    { "skill": "Skill name", "reason": "Why this is emerging but not yet essential" }
  ],
  "rolesToTarget": [
    { "role": "Role name", "reason": "Specific companies hiring + why this matches profile + signal basis", "timeHorizon": "3-6 months" | "6-12 months" | "1-2 years" | "2+ years" }
  ],
  "rolesToAvoid": [
    { "role": "Role name", "reason": "Why this role is contracting or a poor fit right now" }
  ],
  "industriesToMoveToward": [
    { "industry": "Industry name", "reason": "Investment trends + hiring signals that make this attractive", "confidence": 0.1-1.0 }
  ],
  "industriesToAvoid": [
    { "industry": "Industry name", "reason": "Why this industry is contracting or risky" }
  ],
  "keyNarrativeToTell": "A 3-5 sentence positioning statement the user should use in interviews and networking. Specific, confident, no buzzwords.",
  "incomeTrajectoryAssessment": "3-5 sentences assessing realistic path to income goal, specific next steps with expected comp ranges.",
  "biggestRisks": ["Risk 1 (1 sentence, specific)", "Risk 2", "Risk 3"],
  "biggestOpportunities": ["Opportunity 1 (1 sentence, specific)", "Opportunity 2", "Opportunity 3"]
}

Rules:
- Include 3-5 items in skillsToAccelerate, 1-3 in skillsToDeprioritize, 2-4 in skillsToWatch
- Include 2-4 rolesToTarget, 1-3 rolesToAvoid
- Include 2-4 industriesToMoveToward, 1-2 industriesToAvoid
- Include exactly 3 biggestRisks and 3 biggestOpportunities
- Every recommendation must cite specific signal data (companies, percentages, numbers)
- Never use phrases like "consider", "might", "could potentially" — be direct and prescriptive`}c.d(b,{U:()=>d,g:()=>e})},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},64939:a=>{"use strict";a.exports=import("pg")},73136:a=>{"use strict";a.exports=require("node:url")},75811:a=>{"use strict";a.exports=import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs")},76760:a=>{"use strict";a.exports=require("node:path")},78335:()=>{},81676:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{POST:()=>i});var e=c(10641),f=c(33683),g=c(42842),h=a([f,g]);async function i(){let a=await (0,f.j2)();if(!a)return e.NextResponse.json({error:"Unauthorized"},{status:401});try{let b=await (0,g.v)(a.user.id);return e.NextResponse.json({ok:!0,recommendationId:b})}catch(a){return console.error("[recommendations/refresh]",a),e.NextResponse.json({error:"Failed to generate recommendation"},{status:500})}}[f,g]=h.then?(await h)():h,d()}catch(a){d(a)}})},85635:(a,b,c)=>{"use strict";c.d(b,{f:()=>d});let d={pages:{signIn:"/login"},providers:[],callbacks:{authorized({auth:a,request:{nextUrl:b}}){let c=!!a?.user,d=b.pathname,e=d.startsWith("/login")||d.startsWith("/register");return(d.startsWith("/onboarding"),e)?!c||Response.redirect(new URL("/dashboard",b)):!!c||Response.redirect(new URL("/login",b))}}}},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},87314:(a,b,c)=>{"use strict";c.a(a,async(a,d)=>{try{c.r(b),c.d(b,{handler:()=>x,patchFetch:()=>w,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(81676),v=a([u]);u=(v.then?(await v)():v)[0];let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/recommendations/refresh/route",pathname:"/api/recommendations/refresh",filename:"route",bundlePath:"app/api/recommendations/refresh/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/xavierwisniewski/Desktop/Projects /CareerApp/app/api/recommendations/refresh/route.ts",nextConfigOutput:"",userland:u}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function w(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function x(a,b,c){var d;let e="/api/recommendations/refresh/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G=D,G="/index"===G?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}d()}catch(a){d(a)}})},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[331,226,57,972,143],()=>b(b.s=87314));module.exports=c})();