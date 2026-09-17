// These are invented demo conversations based only on the supplied personas.
// No real messages, photographs of family members, trades or Etsy orders are implied.
export const DEMO_VERSION = 2;
const ago = hours => new Date(Date.now()-hours*3600000).toISOString();
const day = offset => new Date(Date.now()+offset*86400000).toISOString().slice(0,10);
const core = ['dad','lea','ada','linus','pascal'];
const grandparents = ['suzanne','denis','claude','nathalie'];
const person = (id,name,initials,color,extra={}) => ({id,name,initials,color,city:'',bio:'',occupation:'',email:'',phone:'',whatsapp:'',interests:[],likes:[],dislikes:[],privacy:{bio:'connections',city:'me',occupation:'connections',email:'me',phone:'me',whatsapp:'me',interests:'connections',likes:'connections',dislikes:'connections'},verified:true,stars:250,plan:'individual',membership:'active',theme:'sunny',...extra});
const child = {family:'home',parent:'dad',verified:false,plan:'family',controls:{messages:true,connections:false,posting:true,stars:true}};

export function createSeed() {
  const members = [
    person('dad','Danny','D','sand',{age:44,family:'home',plan:'family',stars:1500,bio:'44. Family co-op teammate, yoga enthusiast and setter of daily challenges. AoPS (Art of Problem Solving) for mathematical reasoning; CSES.fi for competitive programming. Bring a proof, a counterexample or a better algorithm to the dinner table.',interests:['Enshrouded','Stick Fight','AoPS','CSES.fi','Terraria Complete','Database Inspector','Yoga','Investing'],likes:['Family challenges','Playing together','Explaining your thinking'],dislikes:['Giving up before trying','Spoilers']}),
    person('ada','Ada','A','rose',{...child,controls:{...child.controls},age:7,theme:'rainbow',stars:100,bio:'I am 7! I love unicorns, dogs and figuring things out 🦄🐶 I make Scratch games with scores and levels. I like finding number patterns and explaining them with drawings. Also Toca Boca and games with my family!',interests:['Unicorns','Dogs','Toca Boca','MIT Scratch','Enshrouded','Stick Fight','Brazilian jiu-jitsu','Maths','Number patterns'],likes:['Rainbow colours','Cute dogs','Making games'],dislikes:['Losing my game progress']}),
    person('linus','Linus','L','blue',{...child,controls:{...child.controls},age:11,theme:'terminal',stars:220,bio:'11. Games, medieval history and problems that take more than one try. I work on AoPS maths and CSES.fi competitive programming: finding the idea, testing awkward cases, then explaining why the algorithm works. Also investing questions, Enshrouded and BJJ.',interests:['Enshrouded','Stick Fight','Medieval history','Medieval weapons','History of warfare','Investing','Brazilian jiu-jitsu','AoPS','CSES.fi','Algorithms'],likes:['Strategy games','Good questions','Building together'],dislikes:['Spoilers','Skipping the explanation']}),
    person('pascal','Pascale','P','green',{...child,controls:{...child.controls},age:12,theme:'soft',stars:250,bio:'12. I like a maths proof that clicks and a drawing that turns into something real. AoPS, CSES.fi, Scratch, and masks for my Etsy page. Patterns, symmetry and colour combinations tend to find their way into both my maths and my art. Also Enshrouded and BJJ.',interests:['Drawing','Maths','Mask making','Etsy','MIT Scratch','Enshrouded','Stick Fight','Brazilian jiu-jitsu','AoPS','CSES.fi','Combinatorics'],likes:['Colour palettes','Patterns','Making things by hand'],dislikes:['Smudged drawings','Rushing a project']}),
    person('lea','Leah','LE','rose',{family:'home',plan:'family',theme:'modern',stars:450,bio:'Family games, Brazilian jiu-jitsu and making time to catch up. I enjoy talking through investment ideas with the family and hearing what everyone is making.',interests:['Enshrouded','Stick Fight','Brazilian jiu-jitsu','Investing'],likes:['Playing together','Family conversations','Seeing the children learn'],dislikes:['Spoilers']}),
    person('christina','Kristina','KR','yellow',{theme:'classic',bio:'Helping the household’s days run smoothly. This is where we can work out recipes, groceries and what everyone would like for dinner.',occupation:'Household helper',interests:['Cooking','Recipes','Meal planning','Groceries'],likes:['A clear grocery list','Trying a new recipe','Less food waste'],dislikes:['Last-minute changes after shopping']}),
    person('suzanne','Suzanne','SU','rose',{ageRange:'60s',theme:'soft',bio:'In my 60s. A little yoga, a lovely spa afternoon, and hearing all the family news. There is always time for a quiet cup of tea.',interests:['Yoga','Spa days','Family'],likes:['Quiet mornings','A good stretch','Family updates'],dislikes:['Rushed afternoons']}),
    person('denis','Denis','DE','sand',{ageRange:'70s',theme:'clear',stars:600,bio:'In my 70s. I enjoy investing and talking through ideas with Leah and Danny. Always pleased when Linus arrives with another question. These demo conversations are for discussion, not stock tips.',interests:['Investing','Learning','Family'],likes:['Patient discussion','Asking why','Hearing different views'],dislikes:['Hype without an explanation']}),
    person('claude','Claude','CL','blue',{theme:'mac',bio:'Canadian politics, the latest discussion about Trump or Carney, and a good conversation around the table. I like to bring a question and hear what you think.',interests:['Canadian politics','Donald Trump','Mark Carney','History'],likes:['A lively discussion','Reading the full story'],dislikes:['Headlines without context']}),
    person('nathalie','Nathalie','NA','green',{theme:'modern',bio:'More of a reader than a poster. I like seeing your pictures, your projects and the little things you have been doing. Sometimes a small hello is enough.',interests:['Family','Drawing','Handmade things'],likes:['A quiet catch-up','The children’s projects'],dislikes:[]}),
    person('cielo','Cielo','CI','yellow',{theme:'classic',bio:'Leah’s mother. Sharing prayers, gratitude and faith, and keeping the family close. Thinking of each of you, in the busy days and the quiet ones.',interests:['Prayer','God','Faith','Family'],likes:['Gratitude','Kindness','Family conversations'],dislikes:[]})
  ];
  const excluded = (a,b) => (a==='christina'&&!core.includes(b)) || (b==='christina'&&!core.includes(a)) || (['claude','nathalie'].includes(a)&&['suzanne','denis'].includes(b)) || (['claude','nathalie'].includes(b)&&['suzanne','denis'].includes(a));
  const connections=members.flatMap((a,i)=>members.slice(i+1).filter(b=>!excluded(a.id,b.id)).map(b=>[a.id,b.id]));
  const connected=(a,b)=>a===b||connections.some(pair=>pair.includes(a)&&pair.includes(b));
  const canRead=(id,p)=>id===p.wall||(p.audience==='family'?core.includes(id)&&core.includes(p.wall):connected(id,p.wall));
  const posts=[],challenges=[],messages=[];
  const ledger=members.map(m=>({id:'opening-'+m.id,member:m.id,amount:m.stars,label:'Opening demo allowance',created:ago(24*30)}));
  const add=(author,id,hours,text,extra={},comments=[])=>{
    const post={id,author,wall:author,text,type:'text',audience:'connections',created:ago(hours),likes:[],gifts:0,comments:[],...extra};
    post.likes=(extra.likes||members.filter(m=>m.id!==author&&canRead(m.id,post)).slice(0,2).map(m=>m.id)).filter(id=>canRead(id,post));
    post.comments=comments.map(([author,text],i)=>({author,text,created:ago(Math.max(.01,hours-.15*(i+1)))}));
    posts.push(post);return post;
  };
  const golden={type:'photo',media:'assets/golden-retriever.jpg',mediaType:'image',alt:'A golden retriever sitting in the grass',caption:'Sample dog photo · A throne man · CC0',creditUrl:'https://commons.wikimedia.org/wiki/File:Image_of_golden_retriever.jpg'};
  const corgi={type:'photo',media:'assets/corgi.jpg',mediaType:'image',alt:'A small corgi puppy running through grass',caption:'Sample dog photo · Daniel Stockman · CC BY-SA 2.0 · resized',creditUrl:'https://commons.wikimedia.org/wiki/File:Pembroke_Welsh_Corgi_Puppy.jpg',licenseUrl:'https://creativecommons.org/licenses/by-sa/2.0/'};
  const garden={type:'photo',media:'assets/garden.jpg',mediaType:'image',alt:'A leafy path in the Singapore Botanic Gardens',caption:'Sample garden photo · Balon Greyjoy · CC0',creditUrl:'https://commons.wikimedia.org/wiki/File:20190819_Singapore_Botanic_Gardens_walkway-1.jpg'};

  add('ada','ada-golden',.6,'look at this dog!! 🐶 I would call him Biscuit. What would you call him?',golden,[['pascal','Biscuit is perfect. I want to draw those fluffy ears.'],['nathalie','Such a lovely face, Ada.'],['dad','Biscuit gets my vote.']]);
  add('dad','dad-today',1.4,'Today’s challenges:\n• AoPS — Art of Problem Solving: choose a problem worth thinking about. Explain the key idea and why your argument covers every case.\n• CSES.fi — competitive programming: solve a problem, justify the algorithm, give its time complexity and test an awkward input.\n• Ada: build a Scratch experiment or draw a number pattern, then tell us what you predicted and what happened.\n• Terraria Complete or Database Inspector: investigate a question, show your evidence and challenge your first explanation.\nBring your reasoning. I’m looking forward to having mine challenged too.',{audience:'family'},[['linus','For CSES.fi I’m comparing my one-pass solution with a slow version on small arrays. If they disagree, I get a useful test case.'],['dad','Bring the smallest failing case you can find, and explain which assumption it breaks.'],['ada','i can make the dog game test itself! if the score is wrong the unicorn says NOPE']]);
  add('christina','christina-groceries',2.2,'Grocery list for the next few dinners:\n□ Rice\n□ Chicken\n□ Carrots and cucumber\n□ Tomatoes\n□ Eggs\n□ Bananas\nPlease add anything I have missed before I go shopping.',{},[['lea','Plain yoghurt too, please.'],['pascal','Can we get apples? I can help make a fruit plate.'],['christina','Yoghurt and apples added. Thank you!']]);
  add('linus','linus-castle',3,'I want our next Enshrouded building to look like a medieval castle. Proper gatehouse, towers and a courtyard. Who wants to build which part?',{},[['pascal','I want the banners and the inside rooms.'],['ada','i want a rainbow room'],['dad','I’ll take the jobs nobody wants. Apparently that means gathering materials.']]);
  add('pascal','pascal-mask-poll',4,'Picking colours for my next mask design. Which pair would you choose? I’m testing the colours before I make the final version.',{type:'poll',options:['Midnight blue + silver','Forest green + gold','Pink + lilac','Black + red'],votes:{ada:2,linus:3,lea:0,nathalie:1}},[['ada','pink and lilac!!'],['nathalie','The green and gold sounds beautiful.'],['pascal','I might make a small colour sample of both.']]);
  add('suzanne','suzanne-yoga',5,'A quiet yoga morning sounds lovely. Who would like to join me for a gentle session, at our own pace, and a cup of tea afterwards?',{},[['dad','I’m in. The tea is a good finish.'],['lea','I’ll join you for the catch-up afterwards.']]);
  add('denis','denis-questions',6,'Leah and Danny: before our next investment chat, shall we each bring one business we want to understand better? No need to choose a stock. I’m more interested in the questions we would ask.',{},[['lea','I want to understand how the business earns its money.'],['linus','I want to know why a good company can still be a bad investment.'],['denis','That is an excellent question for the table, Linus.']]);
  add('lea','lea-bjj',8,'BJJ check-in: what is one thing you want to ask your coach next time? I’m writing mine down now so I don’t forget it when class starts.',{},[['pascal','How to stop holding my breath when I’m concentrating.'],['linus','When to stop trying the same thing and change my plan.'],['ada','how to remember what comes next']]);
  add('cielo','cielo-morning',10,'A little prayer for our family today: may we have patience with one another, courage when something is difficult, and grateful hearts for the small good things. Thinking of you all. ❤️',{},[['lea','Thank you, Mum. ❤️'],['ada','love you ❤️'],['nathalie','Thank you, Cielo.']]);
  add('claude','claude-discussion',12,'I’d enjoy a family discussion about Trump and Carney this weekend. What do you want to understand better about their different approaches to politics? Bring the full interview or speech you want to talk about, rather than only a headline.',{},[['dad','Let’s choose one question each so we can actually finish a conversation.'],['lea','And leave room for people to disagree.'],['claude','Agreed. A conversation, not a shouting match.']]);
  add('nathalie','nathalie-hello',15,'I’ve been quietly reading all your updates. The dog names and the mask colours made me smile. Sending a little hello to everyone.',{},[['ada','hi grandma!! 🦄'],['pascal','I’ll show you my next drawing when it’s ready.']]);
  add('ada','ada-dog-poll',20,'which dog is your favourite? you can only pick ONE. this is very hard 🐶',{type:'poll',options:['Golden retriever','Corgi with tiny legs','Fluffy poodle','All dogs (I made a secret extra choice)'],votes:{dad:0,pascal:1,linus:0,lea:3,suzanne:3,cielo:3}},[['linus','You said one and then added all dogs 😂'],['ada','because i could not choose'],['suzanne','I understand completely.']]);
  add('pascal','pascal-scratch',23,'My Scratch collision code was scoring on every frame the star touched the player. I added a collected flag so each star can score only once, then tested overlapping stars and restarting the game. The reset was a separate bug. Sneaky.',{},[['dad','Good catch. What has to be true before a star is allowed to add a point?'],['pascal','It must be touching the player AND not already collected. I set the flag before changing the score. New clones start with their own flag at zero.'],['ada','my unicorn needs that or she gets a million snacks 😂']]);
  add('christina','christina-dinner-poll',26,'Which dinner would you like me to plan next? I can put the ingredients on the list once we decide.',{type:'poll',options:['Chicken and vegetable rice bowls','Tomato pasta','Vegetable soup with bread'],votes:{dad:0,lea:2,ada:1,linus:0,pascal:1}},[['ada','pasta please'],['linus','Rice bowls, but can we put the sauce on the side?'],['christina','Yes, everyone can add their own sauce.']]);
  add('linus','linus-investing',29,'Denis, I have an investing question. If the price changes all the time, how do you decide which information matters and which is just noise? I wrote it in my question list.',{},[['denis','Bring the list when we talk. Let’s take one example and explain our reasoning.'],['dad','Good question. We can compare what each of us would look up first.']]);
  add('dad','dad-stick-fight',32,'Family Stick Fight tonight? A few rounds, then stop while everyone is still laughing. Winner chooses the next game; everyone helps clear up first.',{type:'poll',options:['Stick Fight','Enshrouded building night','Show-and-tell in Scratch'],votes:{ada:2,linus:0,pascal:1,lea:0}},[['ada','i have something to show!!!'],['lea','Let’s see Ada’s project before we start.']]);
  add('suzanne','suzanne-spa',35,'My ideal spa afternoon is very simple: no rushing, a quiet place, and enough time to enjoy being there. What would you put on your perfect restful-afternoon list?',{},[['dad','Yoga first, then absolutely no checking homework for an hour.'],['cielo','A peaceful moment and a grateful heart.']]);
  add('denis','denis-notebook',38,'I’m making a little notebook for our family investment discussions. One page for the idea, one for what we don’t yet understand, and one for what would make us change our minds. Who wants a copy?',{},[['lea','Me, please. Especially the last page.'],['linus','Can mine have a section for new words?'],['denis','Certainly. We can fill that in together.']]);
  add('ada','ada-scratch',41,'my Scratch dog game has levels now! 3 stars opens the rainbow room. i tested 2 stars and the door stayed shut. then 3 and it opened. then i pressed restart and the stars were still there 😂 fixed it!! 🐶',{},[['pascal','Testing just below the target, at the target, and after a restart. That found three different things to check.'],['dad','Show us the prediction you made before each test. I want to see your detective work.']]);
  add('lea','lea-enshrouded',44,'Before the next Enshrouded session, can we agree on one shared project? I vote for making the place feel like somewhere all of us live, including Ada’s rainbow room.',{},[['linus','Castle outside, rainbow room inside. Deal.'],['ada','and a room for dogs'],['pascal','I’m claiming the art room.']]);
  add('claude','claude-headlines',47,'Politics question for the grown-ups: when two headlines describe the same interview differently, what do you check first? I want our Trump and Carney chats to start with the actual words.',{},[['dad','The original interview and the question that came before the clip.'],['nathalie','I may just listen to this discussion.']]);
  add('christina','christina-rice',50,'Recipe plan: rice bowls with chicken, carrots and cucumber, with the sauce served separately. I’ll check what we already have before adding ingredients to the shopping list.',{},[['dad','Sounds good. Please send any missing ingredients here.'],['pascal','I can help arrange the vegetables.'],['christina','Lovely. We can make it colourful.']]);
  add('pascal','pascal-maths',54,'An AoPS-style counting puzzle from my mask sketches: three panels, six colours, no colour repeated. That gives 6 × 5 × 4 = 120 arrangements. If a design and its left-right reflection count as the same, I get 60. The interesting part is proving that dividing by two is allowed.',{},[['linus','Because every arrangement has a different partner when you reflect it? No repeated colours means the two outer panels cannot match.'],['ada','if the outside colours are the same then flipping it does nothing! can we make that version next'],['dad','Exactly. State the symmetry rule first. Then try Ada’s version and work out which designs pair up and which stay fixed.']]);
  add('cielo','cielo-gratitude',58,'Today I’m grateful for the way the children help each other. A small act of kindness can change someone’s whole afternoon. What are you thankful for today?',{},[['ada','Pascale helping my unicorn'],['pascal','Ada being excited about my drawing.'],['lea','A little time together.']]);
  add('nathalie','nathalie-colours',62,'Pascale, I keep thinking about the colour combinations for your masks. When you have a spare moment, I would love to see the sketches. No hurry.',{},[['pascal','I’m still choosing the edges. I’ll show you both versions.'],['nathalie','I would like that.']]);
  add('linus','linus-history',66,'For my next history project I want to compare a castle in a video game with a real medieval castle. Which bits were for everyday life and which bits were for defence? I’m starting with a labelled drawing.',{},[['claude','Include the people who lived and worked there. History is more than battles.'],['pascal','I can help make the drawing readable.'],['dad','Add where each fact came from.']]);
  add('ada','ada-corgi',70,'TINY LEGS. BIG EARS. I love this dog picture 😭🐶 I think this one would be called Noodle.',corgi,[['christina','Biscuit and Noodle would be quite a pair.'],['linus','You’re building a whole team of dogs.'],['ada','yes']]);
  add('dad','dad-progress',74,'Today’s best moments: Pascale explaining why a symmetry argument works, Linus finding an input that breaks his first algorithm, and Ada predicting what her Scratch game would do before running it. Their reasoning is getting sharper. Tomorrow I’m bringing a problem with an assumption worth questioning.',{audience:'family'},[['pascal','Please make it one with two different proofs. I want to see whether the picture and the algebra say the same thing.'],['linus','And I’ll try to break the first solution with a tiny input before trusting the big tests.']]);
  add('suzanne','suzanne-garden',78,'This garden picture has the sort of quiet feeling I would like to bring into my morning. A few minutes for yoga, then a proper pause before the day gets busy.',garden,[['dad','That is a good reminder to put the pause on the calendar too.'],['cielo','A lovely peaceful scene.']]);
  add('denis','denis-language',82,'Linus asked for an investing vocabulary page. Let’s start with the words each of us finds confusing, without pretending we already know them. What would you add?',{},[['linus','Valuation. Everyone says it like it explains everything.'],['lea','Cash flow versus profit.'],['dad','Good list for our next discussion.']]);
  add('lea','lea-family-poll',86,'What should we show the grandparents on our next call?',{type:'poll',options:['Scratch projects','Pascale’s mask sketches','The Enshrouded build','A bit of everything'],votes:{ada:0,linus:2,pascal:1,suzanne:3,denis:3,nathalie:3}},[['suzanne','A little of everything, please.'],['nathalie','I would like to see the drawings.'],['ada','i will show the unicorn first']]);
  add('christina','christina-shopping-done',90,'Shopping is sorted for the rice bowls and pasta. I checked the cupboards first, so we did not buy another bag of rice we didn’t need. Please put next week’s ideas in the dinner poll.',{},[['lea','Thank you, Kristina.'],['dad','Appreciated. I’ll put tomorrow’s plan in the messages.']]);
  add('pascal','pascal-etsy',94,'Working on a new mask idea for my Etsy page. The drawing is easy to change; the finished mask takes more planning. I’m making a small sample before I decide on the final colours.',{},[['nathalie','Taking your time sounds sensible.'],['ada','can there be a unicorn one'],['pascal','I knew you were going to ask that. Maybe a colour sketch first.']]);
  add('claude','claude-question-poll',98,'For our next politics chat, which question would make the best starting point? We can keep the discussion to one subject.',{type:'poll',options:['How to compare two political speeches','What makes a useful interview question','How Canadian politics is discussed at home'],votes:{dad:0,lea:1,cielo:2}},[['dad','One question and a time limit. Sounds like a plan.'],['claude','I’ll bring a question, not a lecture.']]);
  add('cielo','cielo-evening',102,'An evening prayer for a peaceful night and a fresh start tomorrow. May we remember that nobody needs to get everything right to be loved. Sending love to the family.',{},[['lea','Love you, Mum.'],['suzanne','A gentle thought to finish the day.'],['ada','good night 🌈']]);
  add('ada','ada-toca',106,'I made a dog family in Toca Boca. the little dog has the biggest bedroom because he has the most toys. that is fair 🐶',{audience:'family'},[['linus','That is definitely your rule.'],['pascal','Does the dog have a drawing desk?'],['ada','yes and a snack table']]);
  add('linus','linus-bjj',110,'BJJ thought from me: I want to ask better questions instead of just saying “it didn’t work”. Next time I’m going to explain what I tried and when I got stuck.',{},[['lea','That makes it much easier for the coach to help.'],['pascal','I need to remember to ask while I still remember the problem.']]);
  add('dad','dad-database',114,'Database Inspector challenge: investigate why an inventory total doubles after joining two tables. Explain what one row means in each table, find the repeated matches, and check the result against a tiny example you can calculate by hand.',{audience:'family'},[['linus','If one item matches two rows, the join repeats its quantity. I want to compare aggregating before the join with summing afterwards.'],['dad','Show a case where they differ. Then explain what relationship between the tables your proposed fix assumes.']]);
  add('suzanne','suzanne-rest-poll',118,'A little weekend vote. What sounds like a lovely way to slow down?',{type:'poll',options:['Gentle yoga and tea','A spa afternoon','A quiet family walk'],votes:{dad:0,lea:2,cielo:2,denis:1}},[['ada','can the walk have dogs'],['suzanne','We can certainly keep our eyes open for them.']]);
  add('denis','denis-family-chat',122,'Enjoyed hearing everyone’s questions in our last family discussion. Linus, keep bringing the “why?” questions. Leah and Danny, next time I would like to hear an idea you decided against, and why.',{},[['linus','I have more questions now than before.'],['denis','That sounds like a useful conversation to me.']]);
  add('nathalie','nathalie-weekend',126,'A quiet weekend here. I have been looking at your updates with my tea. Thank you for including me in the little everyday things.',{},[['dad','Always glad you’re here.'],['ada','i will send more dogs'],['nathalie','I thought you might. 😊']]);
  add('lea','lea-stick-fight',130,'I am requesting a rematch in Stick Fight. Also requesting that we all remember it is a game and that laughing at ourselves is allowed.',{},[['linus','Rematch accepted.'],['ada','i was laughing so much'],['dad','I am excellent at the laughing part.']]);
  add('christina','christina-recipe-notes',134,'Starting a little recipe note for each dinner: what we made, what was left, and what everyone would change. That should make next week’s grocery list much easier.',{},[['lea','Good idea. Put the children’s suggestions in too.'],['pascal','I can make a title for the notebook.'],['christina','Yes please, Pascale.']]);
  add('pascal','pascal-drawing',138,'Drawing plan for today: one dog, one mask idea and one page of shapes. If I get stuck on one thing, I’ll work on a different page for a while.',{},[['ada','BISCUIT'],['pascal','I thought that would be your suggestion.'],['nathalie','I would love to see the page of shapes as well.']]);
  add('linus','linus-weapon-history',142,'I’m making a history page about medieval shields and armour. Not just what they looked like: who used them, what period they belong to, and how games mix different periods together.',{},[['claude','That last point could make a very interesting comparison.'],['dad','Label the source of each picture and fact.']]);
  add('ada','ada-bjj',146,'i want to remember the names of the things at jiu jitsu. i remember doing them but then the names run away 😂',{},[['lea','We can write down your question before the next class.'],['linus','The names run away from me sometimes too.']]);
  add('dad','dad-yoga',150,'Yoga has made it onto my list today, between homework questions and a request for more Enshrouded materials. If I forget, Suzanne is allowed to remind me.',{},[['suzanne','Consider this your friendly reminder.'],['ada','and remember the rainbow room']]);
  add('claude','claude-listening',154,'I enjoy a lively debate, but I also want to hear the quieter people at the table. Nathalie, no pressure to join the politics chat. Your updates about the children’s projects are always welcome.',{},[['nathalie','Thank you. I am happy to listen and enjoy the drawings.'],['dad','There is room for both.']]);
  add('cielo','cielo-kindness',158,'A small thought for today: let us notice when someone needs encouragement and offer it generously. I’m grateful we have a place to hear about each other’s days.',{},[['pascal','I liked helping Ada with Scratch.'],['cielo','That is exactly the kind of kindness I mean. ❤️']]);
  add('suzanne','suzanne-little-things',162,'My favourite updates this week: a unicorn that says hello, a maths drawing, and a castle with a rainbow room. Please keep sharing your little projects. They brighten my day.',{},[['ada','my unicorn can say bye too'],['pascal','Next week there will probably be another mask drawing.']]);
  add('denis','denis-game-analogy',166,'Linus, perhaps you can explain an investing question to me using one of your games. I will ask questions whenever I lose the thread. No real-money decisions needed; just a chance to practise explaining.',{},[['linus','I have an idea using resources and upgrades.'],['dad','I want to hear this one too.']]);
  add('lea','lea-check-in',170,'Family show-and-tell: bring an idea you can explain, a test that surprised you, or a question you have made more precise. I want to hear how you got there.',{audience:'family'},[['ada','i guessed the next square needed 7 dots and it DID. also the dog game remembers zero when i restart now'],['pascal','A symmetry argument for my mask colours, a Scratch collision fix, and Ada’s excellent counterexample about repeated colours.'],['linus','A proof for the CSES.fi greedy step, a maximum-subarray edge case, and a castle plan that still has room for dogs.']]);
  add('ada','pending-ada',.8,'Danny look!! i made a test button for my Scratch dog game. it tries 2 stars then 3 then restart and checks the door each time. can i show everyone on your wall? 🦄',{wall:'dad',audience:'family',pending:false,likes:[]});

  add('linus','linus-cses-subarray',1.7,'CSES.fi: Maximum Subarray Sum got me with an all-negative array. My first version gave 0 for [-5, -2, -8]. But the subarray must contain something, so the answer is -2. I fixed the starting values and wrote down what my running sum means. The one-pass version is O(n); now I’m checking it against a slow version on small inputs.',{},[["pascal","Try [4, -10, 6, 2, -20]. The best bit is in the middle, not at either end."],["linus","8, from [6, 2]. Also testing one negative number on its own."],["dad","Keep that slow version as a checker. Explain why your two choices at each position cover every possible best segment ending there."]]);
  add('pascal','pascal-aops-proof',2.5,'AoPS practice sent me down a number-pattern rabbit hole: 1 + 3 + 5 + … + (2n − 1) = n². I drew the odd numbers as L-shaped borders around a square, then wrote an induction proof. The picture explains why the algebra works. Ada immediately wanted the next border to be made of dogs.',{},[["ada","7 dogs makes the 4 by 4 square. i checked 🐶"],["linus","Can the same picture explain why (n + 1)² − n² = 2n + 1?"],["pascal","Yes. That new border is exactly n + (n + 1) dots. It is the same argument in another form."]]);
  add('ada','ada-scratch-tests',3.5,'i made a TEST button in Scratch! it gives my dog 2 stars and checks the rainbow door is shut. then 3 stars and it should open. then restart and it should shut again. if one is wrong the unicorn says NOPE. she is very serious about her job 🦄',{},[["linus","Your unicorn is a test runner. I could use one for my CSES.fi code."],["ada","she charges one dog picture"],["pascal","Deal. I like that you wrote what should happen before running each test."]]);

  const changeBalance=(id,amount,label,hours)=>{members.find(m=>m.id===id).stars+=amount;ledger.push({id:'ledger-'+ledger.length,member:id,amount,label,created:ago(hours)});};
  const openChallenge=(id,creator,hours,title,task,format,prize,criteria,entries=[],audience='connections',days=5)=>{
    const post=add(creator,'post-'+id,hours,task,{type:'challenge',challenge:id,audience});
    const challenge={id,post:post.id,creator,judge:creator,title,task,format,deadline:day(days),criteria,prize,reserved:prize,status:'open',entries:entries.map(([author,text],i)=>({id:id+'-entry-'+author,author,text,created:ago(hours-2-i)})),rules:'Free entry. One entry per person, one judge and one winner. The highest score against the published criteria wins. Ties go to the earliest qualifying entry. If cancelled, or if no entry qualifies, all reserved Stars return to the creator with a published reason. Rules cannot change after the first entry.'};
    challenges.push(challenge);changeBalance(creator,-prize,'Reserved: '+title,hours);return challenge;
  };
  openChallenge('scratch-show','dad',18,'Scratch: build it, test it, explain it','Build a Scratch game with a rule you can test: a score threshold, a collision, a level change or a reset. Submit a written walkthrough of the logic, three tests with predicted results, and a bug you found. Explain why your fix works. Make the project and explanation your own.','text',80,'Working logic 35%; purposeful tests 35%; explanation of the bug and fix 30%.',[['ada','my dog needs 3 stars for the rainbow room. i tried 2 and it stayed shut, 3 and it opened, then restart. restart forgot to put the score back to 0 so i added that block. now the door closes too!'],['pascal','A star was scoring once per frame during contact. I added a per-clone collected flag and set it before updating the score. I tested sustained contact, two overlapping stars, and restarting: each star now scores once and the reset clears the score.']],'family',4);
  openChallenge('aiops-note','dad',42,'AoPS: one problem, two convincing arguments','For today’s Art of Problem Solving practice, choose a maths problem that makes you think. Submit the problem in your own words, a complete argument, and a second approach or useful generalisation. Explain why a few successful examples are not a proof. Diagrams, algebra and counterexamples are welcome.','text',100,'Correct and complete reasoning 50%; second approach or generalisation 30%; clarity 20%.',[['linus','My number-theory problem: find positive integers n for which n + 3 divides n² + 3. Since n² + 3 = (n + 3)(n − 3) + 12, n + 3 must divide 12. Its divisors greater than 3 are 4, 6 and 12, so n = 1, 3 or 9. Substituting n ≡ −3 modulo n + 3 gives the same remainder, 12. Listing the divisors proves I have not missed a positive solution.']],'family',3);
  openChallenge('cscs-step','dad',68,'CSES.fi: Increasing Array — explain the greedy step','Work on Increasing Array in the CSES.fi problem set. Submit your own code as text, explain why each increase you make is necessary, and give the time complexity. Include tests for equal neighbours, a descending array and a single element. Explain the integer range needed for the total number of moves.','text',60,'Correct solution 40%; proof of the greedy step 30%; edge cases and complexity 30%.',[],'family',6);
  openChallenge('game-learning','dad',96,'Investigate a game or a database','Choose an objective in Terraria Complete or an investigation in Database Inspector. Make a prediction, record the evidence, and explain what would disprove your first idea. Submit a clear written argument and one test that distinguishes two possible explanations. Your reasoning matters more than speed.','text',90,'Precise question 30%; useful evidence and tests 40%; explanation and conclusions 30%.',[['pascal','My inventory query counted an item twice after a join. I reduced it to one item with quantity 4 and two matching rows: the joined sum was 8. I checked the intended relationship, then grouped the matching table to one row per item before joining. The tiny example returned 4. I also tested an item with no match so the fix would not quietly drop it.']],'family',7);
  openChallenge('mask-pattern','pascal',120,'A pattern for a mask','Draw a repeating pattern you would like to see on a mask. Upload your drawing and a short caption explaining the pattern and colour choices. Please make the drawing yourself.','image',40,'Original pattern 40%; clear repetition 30%; explanation of colours 30%.');
  openChallenge('castle-drawing','linus',144,'Design our game castle','Describe a castle layout for our next family build in Enshrouded. Include a shared room, a practical entrance and something fun for everyone. This is a game design challenge.','text',50,'Clear layout 40%; thought for the whole team 40%; one imaginative detail 20%.',[['ada','rainbow room next to the dog room. the door is big so everyone fits. there is a snack room too.']]);
  const completed=openChallenge('maths-explain','dad',220,'AoPS maths lab: count it and prove it','Invent a counting problem from something you enjoy. State your assumptions, solve it, and justify that every valid outcome is counted exactly once. Then change one condition and explain how the answer changes. Submit your reasoning, not just the final number.','text',70,'Correct reasoning 50%; complete counting argument 30%; thoughtful extension 20%.',[['pascal','Three mask panels use distinct colours from a palette of six: 6 × 5 × 4 = 120 arrangements. Treating left-right reflections as identical gives 60, because every arrangement has a distinct reflected partner. If repeats are allowed, there are 6³ = 216 arrangements and 6 × 6 = 36 fixed by reflection. The remaining 180 pair up, giving 36 + 90 = 126 designs.'],['linus','I counted ways to place two identical watchtowers on five labelled castle positions: 5 × 4 ordered choices, divided by 2, gives 10 pairs. If adjacent positions along the wall are forbidden, the four adjacent pairs are excluded, leaving 6. I listed the six remaining pairs to check the count.']],'family',-2);
  completed.status='awarded';completed.winner='pascal';completed.winnerEntry='maths-explain-entry-pascal';completed.reserved=0;completed.settled=ago(30);changeBalance('pascal',70,'Won: AoPS maths lab: count it and prove it',30);
  for(const [from,to,postId,amount,hours] of [['dad','ada','ada-scratch',10,40],['suzanne','ada','ada-golden',5,.2],['lea','pascal','pascal-scratch',15,22],['denis','linus','linus-investing',10,28]]){
    changeBalance(from,-amount,'Gift to '+members.find(m=>m.id===to).name,hours);changeBalance(to,amount,'Gift from '+members.find(m=>m.id===from).name,hours);posts.find(p=>p.id===postId).gifts+=amount;
  }

  const chat=(a,b,hours,lines)=>lines.forEach((text,i)=>messages.push({id:'message-'+messages.length,from:i%2?b:a,to:i%2?a:b,text,created:ago(hours-i*.12)}));
  // Familiar, small conversations. Only pairs in the supplied connection map appear.
  chat('ada','dad',1,['Danny i made 1 then 4 then 9 dots into squares. i think the next one is 16','What would you add around the 3-by-3 square to make the next one?','4 on one side and 3 on the other because the corner is already there! 7 new dots','That explains the next step. Can your drawing explain how to grow any square?','yes! one side needs one more dot than the other. i am making the dots dogs']);
  chat('ada','pascal',2,['the dog gets another point if he stands still on the star. he is CHEATING','What should happen if he stays there for three seconds? Make that your test first.','only ONE point. i made a collected variable and it says yes after the first point','Good. Does each new star start with its own collected value? Try two stars as well as one.','YES and i tried restart too. the dog cannot cheat now 🐶']);
  chat('ada','linus',3,['can the castle have dogs','We can make a dog room in our build.','with rainbow beds','You can choose the colours. I’m planning the walls.']);
  chat('ada','lea',4,['i forgot the jiu jitsu name again','Let’s write your question down for the coach.','can i draw it instead','Yes, bring your drawing so you can explain.']);
  chat('ada','christina',5,['can we have pasta please','I put pasta in the dinner poll. Did you vote?','yes. i picked pasta','I saw it. Thank you for telling me.']);
  chat('ada','suzanne',6,['grandma look at Biscuit on my wall','I have seen him. What a lovely fluffy dog.','i want to draw him with a unicorn','That sounds like a very cheerful picture.']);
  chat('ada','nathalie',7,['hi grandma do you want another dog picture','Yes please, Ada. I liked the little corgi.','his name is Noodle in my story','Biscuit and Noodle. I will remember.']);
  chat('ada','cielo',8,['good morning ❤️','Good morning, Ada. Sending you lots of love.','i made a unicorn say hello','I would love to hear about it when we talk.']);
  chat('ada','denis',9,['grandpa do you like Biscuit or Noodle','That is a difficult choice. Tell me about Noodle.','tiny legs. very fast','Then I think I need to see this picture.']);
  chat('ada','claude',10,['Linus says you know about castles','I enjoy history. What would you put in your castle?','a rainbow room and dogs','That sounds like a castle nobody would forget.']);
  chat('linus','dad',2.5,['CSES.fi update: my maximum-subarray code returned 0 for [-5, -2, -8]. That would mean choosing no elements, which the problem does not allow.','What does your running value represent? Define that before changing the code.','The best sum of a nonempty subarray ending here. Start with the first element, then choose between starting at x or extending the previous sum with x. Keep the best seen overall. One pass, O(n).','Good. Now justify those two choices and test a single element, all negatives, and a best segment in the middle. Bring the proof as well as the code.']);
  chat('linus','denis',5.5,['I added valuation to my list of investing words.','Good. What do you think the word is trying to describe?','Maybe what something is worth, not just its price?','Bring that thought to our family chat and we will explore it.']);
  chat('linus','claude',11,['I’m comparing game castles with real medieval ones.','Are you including the people who lived and worked inside?','I was mostly thinking about the walls. I’ll add that.','Good history questions often begin with ordinary life.']);
  chat('linus','pascal',13,['Can you try to break my CSES.fi Increasing Array explanation? I raise each number only when it is below the previous adjusted one.','Why can raising an earlier number never make the total cheaper?','It only makes the lower bound for later numbers bigger. The smallest valid value here is the maximum seen so far. Any smaller choice is invalid; a bigger choice cannot help later.','That is the proof. Now check the accumulated moves use a wide enough integer type. Lots of small increases can still make a huge total.']);
  chat('linus','lea',15,['Do you want to join the Enshrouded build tonight?','Yes. What are we building first?','The shared hall. Then Ada’s rainbow room.','Good plan. One project we can all help with.']);
  chat('linus','christina',17,['For the rice bowls, can the sauce be separate?','Yes. I noted that on the recipe.','Thanks. I can help put things on the table.','That would be helpful, thank you.']);
  chat('pascal','dad',3.5,['My mask-counting problem has 120 arrangements, or 60 if reflections count as the same. I want to write up why the halving works.','What stops an arrangement from being its own reflection?','The outer panels use different colours. If I allow repeats, some arrangements are fixed, so I have to count those separately. I get 126 designs in that version.','That is the part worth explaining in your AoPS write-up: the assumption behind the shortcut, and what changes when you remove it.']);
  chat('pascal','nathalie',12,['Would you pick green and gold for a mask?','I like that combination. Have you made a small sample?','Only on paper so far. I’ll do that next.','Send me the sketch when you are ready.']);
  chat('pascal','lea',14,['I’m deciding which mask design to work on for Etsy.','Which one are you most excited to make?','The blue one, but I want to test the edges first.','That sounds like a useful next step.']);
  chat('pascal','christina',18,['Can I make a title page for the recipe notebook?','Yes please. Something we can read easily in the kitchen.','I’ll draw a few vegetables around the title.','Lovely. Leave some space for the weekly date too.']);
  chat('pascal','suzanne',20,['I found a maths problem hiding in my mask designs. Reflection changes how many different designs there are.','Can you show me with the coloured sketches when we call?','Yes. I’ll pair each drawing with its mirror image, then show the ones that stay the same. That explains why sometimes I can divide by two and sometimes I cannot.','Bring those drawings. I like hearing the reasoning behind what you make.']);
  chat('pascal','cielo',22,['Ada found that her Scratch score kept rising while the dog stood on a star.','How did the two of you work it out?','I asked what the score should do, and she designed the standing-still test. Then she added a collected variable and checked the restart herself.','I love that you gave her room to find the answer and explain it.']);
  chat('dad','christina',1.8,['Could we try the chicken and vegetable rice bowls this week? Sauce on the side for everyone.','Yes. I’ll check the cupboards and write the missing ingredients in the grocery post.','Thank you. Please add fruit for the children too.','I have bananas on the list. Pascale asked for apples, so I’ll add those.','Great. Let me know before shopping if the plan needs changing.']);
  chat('lea','christina',6.5,['Could you add plain yoghurt to the grocery list?','Added. Is the dinner poll still the plan for tomorrow?','Yes. Let’s use the vegetables we already have first.','I’ll check them before buying more.']);
  chat('dad','lea',4.5,['AoPS and CSES.fi are up for today. I want a mathematical argument and an algorithm explanation, with time to question each other’s assumptions.','Pascale has a symmetry argument, Linus has an all-negative test case, and Ada wants to demonstrate her Scratch tests.','Excellent. Everyone gets the board before we build in Enshrouded. I’m bringing a follow-up problem.','Leave space for them to challenge your solution too. They will.']);
  chat('dad','denis',8.5,['For the investment chat, I like your page for what would change our minds.','It keeps the discussion interesting. What question are you bringing?','How we decide what we need to understand before forming an opinion.','Good. Let’s give Leah and Linus time for their questions too.']);
  chat('lea','denis',10.5,['I’d like to talk through a company’s business before we discuss its share price.','That sounds like a good starting point for our conversation.','I’ll bring a few questions, not a buy-or-sell decision.','Exactly. We can take our time.']);
  chat('dad','suzanne',16,['You have permission to remind me about yoga.','Here is your reminder. Have you made a little space for it today?','Yes. Then a quiet cup of tea.','A lovely plan.']);
  chat('dad','claude',19,['What do you want to discuss about Trump and Carney?','How they answer difficult interview questions. I want to compare full interviews.','Let’s pick one question and keep the clips in context.','Agreed. I’ll bring a question rather than a speech.']);
  chat('dad','nathalie',24,['Pascale said you liked the green and gold mask colours.','I did. I’m enjoying seeing the projects, even if I don’t post much.','You never need to post to keep up with us.','Thank you. A little message like this is nice.']);
  chat('lea','cielo',9.5,['Thank you for your prayer this morning, Mum.','Thinking of you all. How are the children’s projects going?','Ada is designing Scratch tests, Pascale is connecting symmetry to her mask patterns, and Linus is explaining why his CSES.fi algorithm works. They have a lot to show you.','I would love to hear each of them explain an idea on our next call.']);
  chat('dad','cielo',27,['Your note about encouragement fits our challenge week nicely.','Sometimes a small kind word is what helps someone try again.','I’ll keep that in mind during homework.','Sending love to everyone.']);
  chat('suzanne','denis',28,['Have you seen the dog-name discussion?','Yes. Biscuit and Noodle are now part of my vocabulary.','The little everyday updates are my favourite part.','Mine too, along with Linus’s growing list of questions.']);
  chat('claude','nathalie',31,['Pascale has a mask colour poll if you would like to look.','I voted for green and gold. She sent me a message about the sketch.','Good. I’m glad everyone is sharing their projects.','So am I.']);
  chat('suzanne','cielo',33,['Your evening prayer was a lovely quiet end to the day.','Thank you, Suzanne. I enjoyed your yoga update too.','It is nice to see everyone finding their own little rhythm.','And keeping each other close.']);
  chat('denis','cielo',36,['The children are bringing excellent questions to the family conversations.','I love seeing their curiosity. It gives us plenty to be grateful for.','Ada has asked me to choose between two dogs. That may be the hardest question.','I suspect the answer will be both.']);
  chat('nathalie','cielo',40,['Thank you for remembering the quieter people in your notes.','You are very much part of the family conversation, even when you just read.','That is kind. I enjoy seeing the children’s updates.','Me too.']);
  chat('claude','cielo',43,['I’m trying to leave more space for listening in our family discussions.','That sounds like a good intention. Patience goes a long way.','Even in a politics conversation.','Especially when everyone has a different view.']);
  return {version:DEMO_VERSION,seed:'family-personas',familyNamesVersion:1,learningContentVersion:1,wallPostingVersion:1,current:'dad',joined:false,members,connections,posts:posts.sort((a,b)=>b.created.localeCompare(a.created)),challenges,messages:messages.sort((a,b)=>a.created.localeCompare(b.created)),ledger,reports:[],settings:{},requests:[]};
}

// Apply this correction once to existing demos; keep IDs and all activity intact.
export function migrateFamilyNames(value) {
  if(value?.seed!=='family-personas'||value.familyNamesVersion>=1)return false;
  const names={dad:['Danny','D'],ada:['Ada','A'],linus:['Linus','L'],pascal:['Pascale','P'],lea:['Leah','LE'],christina:['Kristina','KR'],suzanne:['Suzanne','SU'],denis:['Denis','DE'],claude:['Claude','CL'],nathalie:['Nathalie','NA'],cielo:['Cielo','CI']};
  const correct=text=>text.replace(/\bGrandma (Suzanne|Nathalie)\b/g,'$1').replace(/\bGrandpa (Denis|Claude)\b/g,'$1').replace(/\b[Dd]ad\b/g,'Danny').replace(/\bPascal\b/g,'Pascale').replace(/Léa\b/g,'Leah').replace(/\bChristina\b/g,'Kristina').replace('44. Danny, co-op teammate','44. Co-op teammate');
  const fields=(item,keys)=>{for(const key of keys)if(typeof item?.[key]==='string')item[key]=correct(item[key]);};
  for(const person of value.members||[]){
    if(names[person.id])[person.name,person.initials]=names[person.id];
    fields(person,['bio']);
  }
  for(const post of value.posts||[]){
    fields(post,['text','caption','alt']);
    for(const comment of post.comments||[])fields(comment,['text']);
    if(post.options)post.options=post.options.map(option=>typeof option==='string'?correct(option):option);
  }
  for(const message of value.messages||[])fields(message,['text']);
  for(const challenge of value.challenges||[]){
    fields(challenge,['title','task','criteria','rules','reason']);
    for(const entry of challenge.entries||[])fields(entry,['text']);
  }
  for(const entry of value.ledger||[])fields(entry,['label']);
  value.familyNamesVersion=1;
  return true;
}

// One-time editorial update to the invented family demo.
const learningTextCorrections=new Map([
  [
    "44. Co-op teammate and setter of daily challenges. AIops, CSCS, a little yoga, and learning by doing. I like a good question more than a perfect first answer.",
    "44. Family co-op teammate, yoga enthusiast and setter of daily challenges. AoPS (Art of Problem Solving) for mathematical reasoning; CSES.fi for competitive programming. Bring a proof, a counterexample or a better algorithm to the dinner table."
  ],
  [
    "AIops",
    "AoPS"
  ],
  [
    "CSCS",
    "CSES.fi"
  ],
  [
    "I am 7! I love unicorns and dogs 🦄🐶 I make things in Scratch. I like Toca Boca and playing with my family.",
    "I am 7! I love unicorns, dogs and figuring things out 🦄🐶 I make Scratch games with scores and levels. I like finding number patterns and explaining them with drawings. Also Toca Boca and games with my family!"
  ],
  [
    "11. Usually thinking about a game, a castle or how something works. I like medieval history and weapons, investing questions, and Brazilian jiu-jitsu.",
    "11. Games, medieval history and problems that take more than one try. I work on AoPS maths and CSES.fi competitive programming: finding the idea, testing awkward cases, then explaining why the algorithm works. Also investing questions, Enshrouded and BJJ."
  ],
  [
    "I’m 12. I draw, make masks for my Etsy page, do maths and build things in Scratch. Also on the family Enshrouded team. Always another colour combination to try.",
    "12. I like a maths proof that clicks and a drawing that turns into something real. AoPS, CSES.fi, Scratch, and masks for my Etsy page. Patterns, symmetry and colour combinations tend to find their way into both my maths and my art. Also Enshrouded and BJJ."
  ],
  [
    "Danny look!! my unicorn finally stops when i press the button. can you put this on your wall? 🦄",
    "Danny look!! i made a test button for my Scratch dog game. it tries 2 stars then 3 then restart and checks the door each time. can i show everyone on your wall? 🦄"
  ],
  [
    "Today’s little missions:\n• AIops: explain one problem you tried to solve.\n• CSCS: show one exercise and the step you got stuck on.\n• Terraria Complete or Database Inspector: finish one objective and tell us what you learned.\nAn honest attempt counts. Ask for help, then show your own thinking.",
    "Today’s challenges:\n• AoPS — Art of Problem Solving: choose a problem worth thinking about. Explain the key idea and why your argument covers every case.\n• CSES.fi — competitive programming: solve a problem, justify the algorithm, give its time complexity and test an awkward input.\n• Ada: build a Scratch experiment or draw a number pattern, then tell us what you predicted and what happened.\n• Terraria Complete or Database Inspector: investigate a question, show your evidence and challenge your first explanation.\nBring your reasoning. I’m looking forward to having mine challenged too."
  ],
  [
    "Can I explain mine with a game example?",
    "For CSES.fi I’m comparing my one-pass solution with a slow version on small arrays. If they disagree, I get a useful test case."
  ],
  [
    "Yes. Make the example clear enough for Ada to follow.",
    "Bring the smallest failing case you can find, and explain which assumption it breaks."
  ],
  [
    "can mine have a dog in it",
    "i can make the dog game test itself! if the score is wrong the unicorn says NOPE"
  ],
  [
    "Create a tiny Scratch project with a character that moves and reacts. Submit a written walkthrough: what happens, what you changed, and one problem you solved. Your own work and explanation, please.",
    "Build a Scratch game with a rule you can test: a score threshold, a collision, a level change or a reset. Submit a written walkthrough of the logic, three tests with predicted results, and a bug you found. Explain why your fix works. Make the project and explanation your own."
  ],
  [
    "My Scratch project finally changes the score when the character catches a star. It was adding two points because I had the same bit in two places. Found it!",
    "My Scratch collision code was scoring on every frame the star touched the player. I added a collected flag so each star can score only once, then tested overlapping stars and restarting the game. The reset was a separate bug. Sneaky."
  ],
  [
    "Excellent debugging. Tell us how you spotted it.",
    "Good catch. What has to be true before a star is allowed to add a point?"
  ],
  [
    "I slowed it down and watched what happened each time.",
    "It must be touching the player AND not already collected. I set the flag before changing the score. New clones start with their own flag at zero."
  ],
  [
    "can my unicorn catch the stars",
    "my unicorn needs that or she gets a million snacks 😂"
  ],
  [
    "my Scratch unicorn says hello now! it used to say hello lots and lots and lots. Pascale helped me find the block. now it says it one time 🦄",
    "my Scratch dog game has levels now! 3 stars opens the rainbow room. i tested 2 stars and the door stayed shut. then 3 and it opened. then i pressed restart and the stars were still there 😂 fixed it!! 🐶"
  ],
  [
    "You found the second block yourself!",
    "Testing just below the target, at the target, and after a restart. That found three different things to check."
  ],
  [
    "That deserves a demonstration at dinner.",
    "Show us the prediction you made before each test. I want to see your detective work."
  ],
  [
    "Choose one task from today’s AIops homework. Explain the problem in your own words, what you tried, what happened and what you would try next. A thoughtful unfinished attempt is welcome.",
    "For today’s Art of Problem Solving practice, choose a maths problem that makes you think. Submit the problem in your own words, a complete argument, and a second approach or useful generalisation. Explain why a few successful examples are not a proof. Diagrams, algebra and counterexamples are welcome."
  ],
  [
    "I made a maths question from my masks: if I sketch 4 patterns and try 3 colour pairs for each, how many little samples is that? I drew a grid to check my answer.",
    "An AoPS-style counting puzzle from my mask sketches: three panels, six colours, no colour repeated. That gives 6 × 5 × 4 = 120 arrangements. If a design and its left-right reflection count as the same, I get 60. The interesting part is proving that dividing by two is allowed."
  ],
  [
    "12. I want to see the grid.",
    "Because every arrangement has a different partner when you reflect it? No repeated colours means the two outer panels cannot match."
  ],
  [
    "thats lots of masks",
    "if the outside colours are the same then flipping it does nothing! can we make that version next"
  ],
  [
    "Good way to show your reasoning, not just the answer.",
    "Exactly. State the symmetry rule first. Then try Ada’s version and work out which designs pair up and which stay fixed."
  ],
  [
    "Pick one CSCS exercise from today’s homework. Explain the step that made you think, how you checked it, and the question you would ask if you needed help.",
    "Work on Increasing Array in the CSES.fi problem set. Submit your own code as text, explain why each increase you make is necessary, and give the time complexity. Include tests for equal neighbours, a descending array and a single element. Explain the integer range needed for the total number of moves."
  ],
  [
    "One thing I like about our daily challenges: a good “I tried this, it didn’t work, here is what I’ll try next” can be more interesting than a perfect result. Keep those little progress notes.",
    "Today’s best moments: Pascale explaining why a symmetry argument works, Linus finding an input that breaks his first algorithm, and Ada predicting what her Scratch game would do before running it. Their reasoning is getting sharper. Tomorrow I’m bringing a problem with an assumption worth questioning."
  ],
  [
    "My Scratch project has a lot of those notes.",
    "Please make it one with two different proofs. I want to see whether the picture and the algebra say the same thing."
  ],
  [
    "Mine has a page called things I thought would work.",
    "And I’ll try to break the first solution with a tiny input before trusting the big tests."
  ],
  [
    "Complete one objective in Terraria Complete or Database Inspector. Write what the objective was, what you tried, and what you learned. Finishing fastest is not part of the judging.",
    "Choose an objective in Terraria Complete or an investigation in Database Inspector. Make a prediction, record the evidence, and explain what would disprove your first idea. Submit a clear written argument and one test that distinguishes two possible explanations. Your reasoning matters more than speed."
  ],
  [
    "Database Inspector challenge idea: show me the question you wanted to answer, what you inspected, and how you checked the result. Screenshots can help, but your explanation matters most.",
    "Database Inspector challenge: investigate why an inventory total doubles after joining two tables. Explain what one row means in each table, find the repeated matches, and check the result against a tiny example you can calculate by hand."
  ],
  [
    "Can I do a question about our game inventory?",
    "If one item matches two rows, the join repeats its quantity. I want to compare aggregating before the join with summing afterwards."
  ],
  [
    "Yes. Keep it small and explain it clearly.",
    "Show a case where they differ. Then explain what relationship between the tables your proposed fix assumes."
  ],
  [
    "A small family check-in: one thing you made, one thing you learned, and one person you helped this week. Short answers count.",
    "Family show-and-tell: bring an idea you can explain, a test that surprised you, or a question you have made more precise. I want to hear how you got there."
  ],
  [
    "unicorn. loops. Pascale but she helped me",
    "i guessed the next square needed 7 dots and it DID. also the dog game remembers zero when i restart now"
  ],
  [
    "A mask sketch, a Scratch bug, and Ada.",
    "A symmetry argument for my mask colours, a Scratch collision fix, and Ada’s excellent counterexample about repeated colours."
  ],
  [
    "A castle plan, a history question, and the materials team.",
    "A proof for the CSES.fi greedy step, a maximum-subarray edge case, and a castle plan that still has room for dogs."
  ],
  [
    "Invent a small maths question from something you enjoy. Show your answer and explain how you checked it.",
    "Invent a counting problem from something you enjoy. State your assumptions, solve it, and justify that every valid outcome is counted exactly once. Then change one condition and explain how the answer changes. Submit your reasoning, not just the final number."
  ],
  [
    "Make something move in Scratch",
    "Scratch: build it, test it, explain it"
  ],
  [
    "Working interaction 40%; clear explanation 40%; thoughtful attempt 20%.",
    "Working logic 35%; purposeful tests 35%; explanation of the bug and fix 30%."
  ],
  [
    "my unicorn walks to the dog. when i click the dog it says woof. i changed the repeat so it stops!",
    "my dog needs 3 stars for the rainbow room. i tried 2 and it stayed shut, 3 and it opened, then restart. restart forgot to put the score back to 0 so i added that block. now the door closes too!"
  ],
  [
    "My character catches a star and adds one point. I found and removed a duplicate scoring block.",
    "A star was scoring once per frame during contact. I added a per-clone collected flag and set it before updating the score. I tested sustained contact, two overlapping stars, and restarting: each star now scores once and the reset clears the score."
  ],
  [
    "AIops: explain your attempt",
    "AoPS: one problem, two convincing arguments"
  ],
  [
    "Clear problem 30%; evidence of your attempt 40%; useful next step 30%.",
    "Correct and complete reasoning 50%; second approach or generalisation 30%; clarity 20%."
  ],
  [
    "I wrote down the steps before starting, then compared what I expected with what actually happened. My next step is to test one change at a time.",
    "My number-theory problem: find positive integers n for which n + 3 divides n² + 3. Since n² + 3 = (n + 3)(n − 3) + 12, n + 3 must divide 12. Its divisors greater than 3 are 4, 6 and 12, so n = 1, 3 or 9. Substituting n ≡ −3 modulo n + 3 gives the same remainder, 12. Listing the divisors proves I have not missed a positive solution."
  ],
  [
    "CSCS: show the tricky step",
    "CSES.fi: Increasing Array — explain the greedy step"
  ],
  [
    "Explanation of the step 40%; checking your answer 40%; a useful question 20%.",
    "Correct solution 40%; proof of the greedy step 30%; edge cases and complexity 30%."
  ],
  [
    "Play, then explain",
    "Investigate a game or a database"
  ],
  [
    "Understanding the objective 30%; explanation of the attempt 40%; reflection 30%.",
    "Precise question 30%; useful evidence and tests 40%; explanation and conclusions 30%."
  ],
  [
    "I wrote down the objective first and checked my result against it. When something did not match, I went back through the steps instead of restarting everything.",
    "My inventory query counted an item twice after a join. I reduced it to one item with quantity 4 and two matching rows: the joined sum was 8. I checked the intended relationship, then grouped the matching table to one row per item before joining. The tiny example returned 4. I also tested an item with no match so the fix would not quietly drop it."
  ],
  [
    "A maths answer we can follow",
    "AoPS maths lab: count it and prove it"
  ],
  [
    "Correct reasoning 50%; clear explanation 30%; useful check 20%.",
    "Correct reasoning 50%; complete counting argument 30%; thoughtful extension 20%."
  ],
  [
    "Four patterns with three colour pairs each gives twelve samples. I drew a 4 by 3 grid and counted the boxes to check.",
    "Three mask panels use distinct colours from a palette of six: 6 × 5 × 4 = 120 arrangements. Treating left-right reflections as identical gives 60, because every arrangement has a distinct reflected partner. If repeats are allowed, there are 6³ = 216 arrangements and 6 × 6 = 36 fixed by reflection. The remaining 180 pair up, giving 36 + 90 = 126 designs."
  ],
  [
    "I counted four teams with three players on each team. Four groups of three gives twelve.",
    "I counted ways to place two identical watchtowers on five labelled castle positions: 5 × 4 ordered choices, divided by 2, gives 10 pairs. If adjacent positions along the wall are forbidden, the four adjacent pairs are excluded, leaving 6. I listed the six remaining pairs to check the count."
  ],
  [
    "I helped Ada find the Scratch block.",
    "Ada found that her Scratch score kept rising while the dog stood on a star."
  ],
  [
    "That was kind. Was she pleased?",
    "How did the two of you work it out?"
  ],
  [
    "Very. The unicorn finally stopped talking.",
    "I asked what the score should do, and she designed the standing-still test. Then she added a collected variable and checked the restart herself."
  ],
  [
    "Then you both have something to be happy about.",
    "I love that you gave her room to find the answer and explain it."
  ],
  [
    "Do you want to see my page of patterns on our next call?",
    "I found a maths problem hiding in my mask designs. Reflection changes how many different designs there are."
  ],
  [
    "Very much. Can you tell me how you came up with them?",
    "Can you show me with the coloured sketches when we call?"
  ],
  [
    "One started as a maths grid and turned into a mask idea.",
    "Yes. I’ll pair each drawing with its mirror image, then show the ones that stay the same. That explains why sometimes I can divide by two and sometimes I cannot."
  ],
  [
    "That sounds wonderfully like you.",
    "Bring those drawings. I like hearing the reasoning behind what you make."
  ],
  [
    "Will you draw the plan if I work out the rooms?",
    "Can you try to break my CSES.fi Increasing Array explanation? I raise each number only when it is below the previous adjusted one."
  ],
  [
    "Yes, but give me the sizes before I draw the whole thing.",
    "Why can raising an earlier number never make the total cheaper?"
  ],
  [
    "Ada has requested a dog room and a snack room.",
    "It only makes the lower bound for later numbers bigger. The smallest valid value here is the maximum seen so far. Any smaller choice is invalid; a bigger choice cannot help later."
  ],
  [
    "Naturally. I’ll leave room for both.",
    "That is the proof. Now check the accumulated moves use a wide enough integer type. Lots of small increases can still make a huge total."
  ],
  [
    "Ada has a talking unicorn and Pascale fixed a scoring bug.",
    "Ada is designing Scratch tests, Pascale is connecting symmetry to her mask patterns, and Linus is explaining why his CSES.fi algorithm works. They have a lot to show you."
  ],
  [
    "I would love a little demonstration on our next call.",
    "I would love to hear each of them explain an idea on our next call."
  ],
  [
    "I put the homework challenges up. Nothing needs to be perfect on the first attempt.",
    "AoPS and CSES.fi are up for today. I want a mathematical argument and an algorithm explanation, with time to question each other’s assumptions."
  ],
  [
    "Good. Leave time for the children to show us what they made.",
    "Pascale has a symmetry argument, Linus has an all-negative test case, and Ada wants to demonstrate her Scratch tests."
  ],
  [
    "Scratch demonstrations before Stick Fight?",
    "Excellent. Everyone gets the board before we build in Enshrouded. I’m bringing a follow-up problem."
  ],
  [
    "Yes. Ada has already announced hers.",
    "Leave space for them to challenge your solution too. They will."
  ],
  [
    "I found why Scratch was counting two points.",
    "My mask-counting problem has 120 arrangements, or 60 if reflections count as the same. I want to write up why the halving works."
  ],
  [
    "Tell me what you checked.",
    "What stops an arrangement from being its own reflection?"
  ],
  [
    "There were two copies of the scoring block. I tested it after removing one.",
    "The outer panels use different colours. If I allow repeats, some arrangements are fixed, so I have to count those separately. I get 126 designs in that version."
  ],
  [
    "Great. That explanation belongs in your challenge entry.",
    "That is the part worth explaining in your AoPS write-up: the assumption behind the shortcut, and what changes when you remove it."
  ],
  [
    "Can my AIops explanation use a game example?",
    "CSES.fi update: my maximum-subarray code returned 0 for [-5, -2, -8]. That would mean choosing no elements, which the problem does not allow."
  ],
  [
    "Yes. Explain the problem first, then the example.",
    "What does your running value represent? Define that before changing the code."
  ],
  [
    "And for CSCS, should I include the bit I got wrong?",
    "The best sum of a nonempty subarray ending here. Start with the first element, then choose between starting at x or extending the previous sum with x. Keep the best seen overall. One pass, O(n)."
  ],
  [
    "Definitely. Show how you checked it.",
    "Good. Now justify those two choices and test a single element, all negatives, and a best segment in the middle. Bring the proof as well as the code."
  ],
  [
    "my unicorn is saying hello forever",
    "the dog gets another point if he stands still on the star. he is CHEATING"
  ],
  [
    "Look for a repeat block around the speech block.",
    "What should happen if he stays there for three seconds? Make that your test first."
  ],
  [
    "i found TWO",
    "only ONE point. i made a collected variable and it says yes after the first point"
  ],
  [
    "Try one change and press the green flag again.",
    "Good. Does each new star start with its own collected value? Try two stars as well as one."
  ],
  [
    "IT WORKS 🦄",
    "YES and i tried restart too. the dog cannot cheat now 🐶"
  ],
  [
    "Danny can you see my dog poll",
    "Danny i made 1 then 4 then 9 dots into squares. i think the next one is 16"
  ],
  [
    "I can. I voted for the golden retriever.",
    "What would you add around the 3-by-3 square to make the next one?"
  ],
  [
    "good choice. he is Biscuit",
    "4 on one side and 3 on the other because the corner is already there! 7 new dots"
  ],
  [
    "Please show me the unicorn project after dinner.",
    "That explains the next step. Can your drawing explain how to grow any square?"
  ],
  [
    "yes!! it stops now",
    "yes! one side needs one more dot than the other. i am making the dots dogs"
  ],
  [
    "Reserved: Make something move in Scratch",
    "Reserved: Scratch: build it, test it, explain it"
  ],
  [
    "Reserved: AIops: explain your attempt",
    "Reserved: AoPS: one problem, two convincing arguments"
  ],
  [
    "Reserved: CSCS: show the tricky step",
    "Reserved: CSES.fi: Increasing Array — explain the greedy step"
  ],
  [
    "Reserved: Play, then explain",
    "Reserved: Investigate a game or a database"
  ],
  [
    "Reserved: A maths answer we can follow",
    "Reserved: AoPS maths lab: count it and prove it"
  ],
  [
    "Won: A maths answer we can follow",
    "Won: AoPS maths lab: count it and prove it"
  ]
]);

export function migrateFamilyLearning(value){
  if(value?.seed!=='family-personas'||value.learningContentVersion>=1)return false;
  const correct=text=>learningTextCorrections.get(text)??text.replace(/\b(?:AIops|Alops|CSCS)\b/gi,term=>term.toLowerCase()==='cscs'?'CSES.fi':'AoPS');
  const fields=(item,keys)=>{for(const key of keys)if(typeof item?.[key]==='string')item[key]=correct(item[key]);};
  const fresh=createSeed();
  for(const person of value.members||[]){
    fields(person,['bio']);
    if(person.interests)person.interests=person.interests.map(correct);
    const additions={ada:['Maths','Number patterns'],linus:['AoPS','CSES.fi','Algorithms'],pascal:['AoPS','CSES.fi','Combinatorics']}[person.id];
    if(additions&&person.interests)person.interests=[...new Set([...person.interests,...additions])];
  }
  for(const post of value.posts||[]){fields(post,['text','caption','alt']);for(const comment of post.comments||[])fields(comment,['text']);}
  for(const message of value.messages||[])fields(message,['text']);
  for(const challenge of value.challenges||[]){fields(challenge,['title','task','criteria']);for(const entry of challenge.entries||[])fields(entry,['text']);}
  for(const entry of value.ledger||[])fields(entry,['label']);
  const memberIds=new Set((value.members||[]).map(p=>p.id));
  for(const id of ['linus-cses-subarray','pascal-aops-proof','ada-scratch-tests']){
    const post=fresh.posts.find(p=>p.id===id);
    if(!memberIds.has(post.author)||(value.posts||[]).some(p=>p.id===id))continue;
    post.comments=post.comments.filter(c=>memberIds.has(c.author));post.likes=post.likes.filter(id=>memberIds.has(id));
    (value.posts??=[]).push(post);
  }
  value.posts?.sort((a,b)=>b.created.localeCompare(a.created));
  value.learningContentVersion=1;
  return true;
}
export function migrateFamilyDemo(value){
  const namesChanged=migrateFamilyNames(value);
  const learningChanged=migrateFamilyLearning(value);
  let wallsChanged=false;
  if(value?.seed==='family-personas'&&!value.wallPostingVersion){
    // Publish only the unchanged demo fixture. Preserve held content written by the user.
    const held=value.posts?.find(p=>p.id==='pending-ada');
    const fixture=createSeed().posts.find(p=>p.id==='pending-ada');
    if(held?.pending&&held.author===fixture.author&&held.wall===fixture.wall&&held.audience===fixture.audience&&held.text===fixture.text)held.pending=false;
    value.wallPostingVersion=1;
    wallsChanged=true;
  }
  return namesChanged||learningChanged||wallsChanged;
}
