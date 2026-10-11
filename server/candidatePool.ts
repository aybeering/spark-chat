import { MatchedPartner, CollaborationProfile } from '../src/types/profile';

export interface CandidateEntry {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  city: string;
  yearsOfExperience: string;
  avatar: string;
  phone: string;
  profile: CollaborationProfile;
}

export const SEED_CANDIDATE_POOL: CandidateEntry[] = [
  {
    id: 'cand-linche',
    name: '林澈',
    title: '创始人兼CTO',
    company: '智识拓扑（深圳）AI实验室',
    industry: '人工智能 / 企业服务',
    city: '深圳',
    yearsOfExperience: '9年',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+86 138-0288-9102',
    profile: {
      name: '林澈',
      title: '创始人兼CTO',
      company: '智识拓扑（深圳）AI实验室',
      industry: '人工智能 / 企业服务',
      city: '深圳',
      yearsOfExperience: '9年',
      capability: {
        content: '我擅长企业级垂类大模型微调与多模态AI Agent架构设计，带领25人清华及斯坦福算法团队研发了推理成本降低68%的企业中台引擎，系统吞吐量提升4倍。',
        highlights: ['算法在垂直NLP测评排名前3%', '完成真格/线性数千万元投资', '积累15万+开发者与2000万次月调用'],
        tags: ['技术研发', '人工智能', '产品设计', '团队管理']
      },
      resources: {
        content: '我拥有完整的AI Agent底层知识产权、高效私有化算力优化算法，以及硅谷和清华系顶尖AI创投圈资源。',
        items: [
          { type: '技术研发', desc: '自主知识产权模型工作流引擎' },
          { type: '算力与团队', desc: '25人全职清华/斯坦福算法工程团队' }
        ],
        scale: '月调用2000万次企业级智能中台架构',
        tags: ['技术团队', '高校科研', '投融资圈']
      },
      endorsement: {
        content: '前腾讯AI Lab高级研究员，6篇顶级会议论文，12项发明专利，天使轮与Pre-A轮均获一线美金基金领投。',
        highlights: ['腾讯AI Lab核心算法专家', '顶级风投数千万元加持', '6篇顶会与12项核心专利'],
        summary: '清华系顶尖AI算法创始人',
        tags: ['人工智能', '技术研发', '知名雇主']
      },
      intent: {
        content: '【我能提供】硬核AI Agent与企业私有化模型产品、极速交付能力及丰厚渠道分成。\n【我在寻找】拥有政企、金融、工业央国企决策人资源与渠道分销能力的合伙人，全面开展商业化落地。',
        seeking: ['政企央国企大客户渠道商', '具备300万+客单价成交经验的BD领袖', '海外跨境电商场景合作伙伴'],
        offering: ['技术全包支持与定制PoC', '独家分销授权与高额利润分成', '模型私有化部署架构'],
        supplyTags: ['技术研发', '人工智能', '产品设计', '技术合作'],
        demandTags: ['渠道网络', '大客户人脉', 'BD拓展', '渠道分销'],
        tags: ['渠道分销', '联合运营', '技术合作']
      },
      taboo: {
        content: '拒绝无商务场景的低价外包代工，拒绝买断底层代码专利，拒绝无诚意空手套方案。',
        items: ['纯外包低端代工', '要求买断核心算法', '虚假概念炒作'],
        tags: ['软件外包', '买断代码', '虚假宣发'],
        keywords: ['外包', '买断', '白嫖代码', '炒作', '廉价代工']
      },
      idealPartner: {
        content: '拥有传统政企或大型民企核心销售网络的老练商业操盘手，能够补齐我们技术团队不善于应酬与长周期大客商务公关的短板。',
        partnerTraits: ['拥有深厚央国企大客户人脉', '精通招投标与渠道生态构建', '具备极强商业信誉'],
        collaborationScenarios: ['联合投标央企智能化转型重大课题', '按行业纵深成立联合运营事业部'],
        tags: ['BD拓展', '渠道网络', '大客户人脉']
      }
    }
  },
  {
    id: 'cand-shenyifei',
    name: '沈逸飞',
    title: '商业化副总裁 / 渠道合伙人',
    company: '云策智能（北京）科技有限公司',
    industry: 'SaaS / 企业服务',
    city: '北京',
    yearsOfExperience: '12年',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+86 138-1120-9988',
    profile: {
      name: '沈逸飞',
      title: '商业化副总裁 / 渠道合伙人',
      company: '云策智能（北京）科技有限公司',
      industry: 'SaaS / 企业服务',
      city: '北京',
      yearsOfExperience: '12年',
      capability: {
        content: '我擅长政企大客户拓展与全国分销渠道网络搭建，拥有12年企业服务商业化经验。统筹80人销售铁军，沉淀了“标杆直销打样+ISV生态联运”方法论，带领团队实现年分销GMV破1.8亿（增长140%），签约央国企客单价350万+。',
        highlights: [
          '搭建全国5大战区300+核心ISV渠道网络，带动分销GMV 1.8亿元',
          '亲自拓展国家电网、中化集团等标杆客户，大客续约率达91%',
          '统领80人跨区域销售与渠道铁军，提升业务毛利率22%'
        ],
        tags: ['BD拓展', '渠道网络', '团队管理', '增长策略', 'SaaS']
      },
      resources: {
        content: '我可深度调动50+央国企与500强企业CIO/数字化采购关键决策人人脉，以及300家成熟政企集成商渠道库，可实现联合投标与快速分销。',
        items: [
          { type: '大客户决策层', desc: '50+央国企/头部500强数字化一号位及采购关键人' },
          { type: '渠道网络', desc: '300家华北/华东成熟政企ISV及系统集成商' }
        ],
        scale: '覆盖300+核心渠道伙伴及数亿级政企数字化采购商机',
        tags: ['大客户人脉', '渠道网络', '投融资圈', '企业服务']
      },
      endorsement: {
        content: '前纷享销客销售总监，曾荣获行业最佳商业化领航奖，主导过多个国家级数字化示范项目。',
        highlights: ['年分销业绩1.8亿，大客客单价突破350万元', '操盘百余家500强签约案例'],
        summary: '12年企服老兵，1.8亿GMV渠道操盘者',
        tags: ['大客户人脉', 'SaaS', '增长策略']
      },
      intent: {
        content: '【我能提供】全国大客政企渠道分销网络、头部SaaS商业化铁军打法输出，以及数百万级央国企数字化联合投标资格。\n【我在寻找】拥有前沿垂直AI Agent或智能化工作流生产力工具的技术产品团队，双方通过产品研发+渠道变现实现价值最大化。',
        seeking: ['具备技术壁垒的AI企业服务Agent或智能知识库产品', '寻求全国政企/金融/能源大客户快速落地的技术型团队'],
        offering: ['全国300+现成政企渠道商网络与分销带货能力', '50+标杆央国企CIO级决策人人脉直通引荐'],
        supplyTags: ['渠道网络', '大客户人脉', 'BD拓展', '渠道分销'],
        demandTags: ['技术研发', '人工智能', '产品设计', '联合开发'],
        tags: ['渠道分销', '联合运营', '技术合作']
      },
      taboo: {
        content: '明确拒绝没有实际运行场景的概念期纯Demo，拒绝账期超过6个月的纯佣金CPS模式，拒绝存在数据合规漏洞的项目。',
        items: ['无成熟客户落地场景的空泛AI概念Demo', '无底线垫资、账期超6个月的纯提成合作', '数据与模型来源合规风险未解的项目'],
        tags: ['纯佣金制', '无案例Demo', '超长账期'],
        keywords: ['纯佣金', '纯提成', 'CPS', '按效果付费', '垫资', '空手套白狼']
      },
      idealPartner: {
        content: '最能与我形成互补的是清北/海归背景的硬核AI产品团队：拥有顶尖技术架构与开箱即用的AI Agent产品原型，但缺乏大B端销售基因与政企渠道关系。',
        partnerTraits: ['技术研发与AI模型产品化能力极强', '拥有已通过PoC验证的企业级智能Agent', '诚意开展联合运营或渠道分销'],
        collaborationScenarios: ['联合开发政企AI定制解决方案，我方包销入围央企采购清单', '独家渠道代理+利润分成'],
        tags: ['人工智能', '技术研发', '产品设计']
      }
    }
  },
  {
    id: 'cand-suman',
    name: '苏曼',
    title: '供应链副总裁 / 联席合伙人',
    company: '沃客严选（杭州）供应链管理有限公司',
    industry: '消费品 / 跨境电商',
    city: '杭州',
    yearsOfExperience: '11年',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    phone: '+86 139-5712-8831',
    profile: {
      name: '苏曼',
      title: '供应链副总裁 / 联席合伙人',
      company: '沃客严选（杭州）供应链管理有限公司',
      industry: '消费品 / 跨境电商',
      city: '杭州',
      yearsOfExperience: '11年',
      capability: {
        content: '我掌管快消与个护美妆柔性供应链体系，协同长三角及珠三角80+深度合作工厂。搭建小单快反机制，新品打样周期缩短至5天，库存周转天数仅18天。',
        highlights: ['支撑3个D2C新消费品牌在TikTok与亚马逊从0做到年销2.5亿GMV', '独家签约5家年产值过亿源头代工厂', '具备低于行业大盘15%的直供议价权'],
        tags: ['供应链管理', '产品设计', '团队管理', '跨境电商']
      },
      resources: {
        content: '我拥有80+长三角珠三角深度绑定的优质源头工厂，以及头部MCN机构选品部负责人与200+头部达人合作通道，广州与宁波保税仓现成仓储。',
        items: [
          { type: '优质工厂', desc: '80+具备FDA/CE国际认证的源头实力工厂' },
          { type: '电商渠道', desc: '成熟的保税仓物流及跨境专线仓储' }
        ],
        scale: '年吞吐超5000万件消费品柔性生产体系',
        tags: ['供应链', '渠道网络', 'KOL/达人']
      },
      endorsement: {
        content: '前网易严选资深选品及供应链专家，操盘爆品年销售额数亿元，荣获中国新消费金牌供应链操盘手。',
        highlights: ['前网易严选资深选品操盘手', '年支撑2.5亿出海电商GMV', '获新消费年度供应链金奖'],
        summary: '11年消费品柔性供应链掌舵人',
        tags: ['知名雇主', '消费品', '跨境电商']
      },
      intent: {
        content: '【我能提供】极致性价比的源头爆品供应链支撑、小单快反定制生产能力、严选级质检与仓储物流全托管。\n【我在寻找】在北美、欧洲或中东拥有成熟独立站运营、TikTok投流团队、或大型零售商超买手资源的团队共同出海。',
        seeking: ['跨境电商独立站与TikTok运营操盘团队', '海外线下大型零售商超买手资源', '出海品牌营销增长专家'],
        offering: ['源头直供爆品供应链与排他性底价', '5天极速打样与小单快反保供', '仓储物流一件代发支持'],
        supplyTags: ['供应链管理', '供应链', '渠道分销'],
        demandTags: ['跨境电商', '品牌营销', '增长策略', '海外渠道'],
        tags: ['渠道分销', '品牌联名', '联合运营']
      },
      taboo: {
        content: '拒绝资金链断裂或无预付款押金要求的无底线账期合作，不碰侵权仿冒违规产品，拒绝无操盘经验的纯新手团队空手套白狼。',
        items: ['无预付款超长恶意账期', '侵权仿冒违规违禁品', '无操盘业绩的空头中介'],
        tags: ['超长账期', '侵权违规', '空手套白狼'],
        keywords: ['垫资', '欠款', '高仿', '侵权', '空手套']
      },
      idealPartner: {
        content: '拥有极强海外流量投放、社交媒体操盘或线下大渠道网络的分销操盘团队，他们擅长拿流量与促转化，我负责高质低价供应链底座，形成出海无敌闭环。',
        partnerTraits: ['在TikTok/Meta等海外投放有百万级消耗战功', '具备成熟跨境独立站操盘经验'],
        collaborationScenarios: ['联合打造海外垂直D2C品牌并按股权与利润分成', '独家供应链代工与现货一件代发支持'],
        tags: ['跨境电商', '增长策略', '海外渠道']
      }
    }
  },
  {
    id: 'cand-zhouhansen',
    name: '周瀚森',
    title: '数字化转型合伙人',
    company: '普华永道 (PwC) 数字化咨询业务部',
    industry: '企业服务 / 顾问咨询',
    city: '北京',
    yearsOfExperience: '14年',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    phone: '+86 139-1102-3948',
    profile: {
      name: '周瀚森',
      title: '数字化转型合伙人',
      company: '普华永道 (PwC) 数字化咨询业务部',
      industry: '企业服务 / 顾问咨询',
      city: '北京',
      yearsOfExperience: '14年',
      capability: {
        content: '我精通大型集团企业数字化顶层设计与IT治理规划，主导过10余家千亿级央企集团数字化五年规划。掌控千万级央企数字化咨询预算规划，可直接在顶层方案中植入推荐伙伴产品。',
        highlights: ['操盘数字化咨询合同累计超1.2亿元', '直接对接20+央国企副总裁及CIO', '出版企业数字化战略专著'],
        tags: ['战略规划', '顾问咨询', '政府关系', '团队管理']
      },
      resources: {
        content: '我手握大型国有能源、高端制造集团核心高管信赖关系，常年主导重大信息化专项招标专家库。',
        items: [
          { type: '决策层人脉', desc: '20+千亿级国央企一号位及专家委员会' },
          { type: '行业协会', desc: '中国产业数字化发展促进会副理事长' }
        ],
        scale: '年度咨询牵引数亿元IT采购落地',
        tags: ['大客户人脉', '政府关系', '行业协会']
      },
      endorsement: {
        content: '14年四大咨询合伙人，国家级智能制造评审特邀专家，牵头多项行业标准制定。',
        highlights: ['四大合伙人级别背书', '国家部委数字化特聘专家', '主持20+央企重大项目'],
        summary: '顶尖咨询合伙人，央企顶层规划者',
        tags: ['顾问咨询', '战略规划']
      },
      intent: {
        content: '【我能提供】央企头部大客户高层立项通路、千万级项目顶层规划植入机会。\n【我在寻找】具备强劲交付力与前沿AI/SaaS能力的落地供应商伙伴，实现战略咨询到工程落地的闭环。',
        seeking: ['具备政企资质的优质SaaS/AI厂商', '高效履约与分销服务商', '技术研发实力雄厚的解决方案团队'],
        offering: ['央企高层立项机会', '联合解决方案包装与品牌溢价', '顶层方案联合投标'],
        supplyTags: ['顾问咨询', '战略规划', '大客户人脉'],
        demandTags: ['SaaS', '人工智能', '联合开发', '技术研发'],
        tags: ['联合运营', '顾问咨询', '技术合作']
      },
      taboo: {
        content: '拒绝交付能力低下、售后服务不稳定的初创草台班子；拒绝财务法务不合规的灰色操作。',
        items: ['无交付保障的草台班子', '合规风险项目', '纯低价恶性竞标'],
        tags: ['劣质交付', '合规瑕疵', '低价恶性竞争'],
        keywords: ['交付崩盘', '合规风险', '纯低价', '无资质']
      },
      idealPartner: {
        content: '具备高度专业素养的成熟企服与SaaS操盘手，懂政企客户沟通语言，有强大的交付和渠道团队打底。',
        partnerTraits: ['拥有百人级成熟实施及商务团队', '有大型国企成功标杆案例'],
        collaborationScenarios: ['咨询方案+产品联合体联合拿单', '行业沙龙高管闭门会资源互换'],
        tags: ['SaaS', '企业服务', '渠道网络']
      }
    }
  },
  {
    id: 'cand-hanmenglu',
    name: '韩梦璐',
    title: '投资合伙人',
    company: '经纬创投 企服与AI基金',
    industry: '金融科技 / 投资孵化',
    city: '北京',
    yearsOfExperience: '10年',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    phone: '+86 137-0103-7721',
    profile: {
      name: '韩梦璐',
      title: '投资合伙人',
      company: '经纬创投 企服与AI基金',
      industry: '金融科技 / 投资孵化',
      city: '北京',
      yearsOfExperience: '10年',
      capability: {
        content: '我专注企服SaaS与生成式AI赛道早期投资，管理数亿元专项基金，曾捕获3家AI独角兽。被投库内拥有10+经过严格技术尽调的顶尖AI Agent早期黑马项目。',
        highlights: ['主导投资18个企服与AI项目', '2家被投企业完成美股及港股IPO', '深度构建产业资本协同网络'],
        tags: ['融资并购', '战略规划', '投资孵化', '人工智能']
      },
      resources: {
        content: '我连接30+知名美元/人民币基金管理合伙人，以及由数百位AI技术创始人构成的校友生态网络。',
        items: [
          { type: '资本资源', desc: '数十亿规模早期与成长型创投资金池' },
          { type: '技术团队', desc: '被投生态数十家顶尖AI与SaaS创新公司' }
        ],
        scale: '管理及协同资本超15亿元',
        tags: ['投融资圈', '技术团队', '产业园区']
      },
      endorsement: {
        content: '福布斯中国30位30岁以下创投精英，36氪年度最具发现力企服投资人。',
        highlights: ['福布斯30U30创投精英', '36氪年度企服投资人', '捕获3家独角兽'],
        summary: '一线创投合伙人，企服AI捕手',
        tags: ['投融资圈', '融资并购']
      },
      intent: {
        content: '【我能提供】被投优质技术项目商业化赋能机会、充沛风险投资资金对接与战略并购资源。\n【我在寻找】战功赫赫的B2B销售统帅与渠道老兵，帮我们被投的技术天才们解决市场准入与商业化大考。',
        seeking: ['具备亿级商业化战功的渠道销售领军人', '真实大客场景与落地PoC', '技术产品商业化合伙人'],
        offering: ['独家被投项目商务独代权', '战略投资与顾问股权激励', '产业资本直投渠道'],
        supplyTags: ['投融资圈', '投资孵化', '战略规划'],
        demandTags: ['BD拓展', '渠道网络', '增长策略'],
        tags: ['股权合作', '顾问咨询', '投资孵化']
      },
      taboo: {
        content: '拒绝商业道德存疑、简历履约数据严重造假、或缺乏共赢心态的投机分子。',
        items: ['简历数据造假', '飞单挪用商业机密', '短视投机'],
        tags: ['诚信缺失', '商业欺诈', '飞单风险'],
        keywords: ['造假', '飞单', '欺诈', '不守信']
      },
      idealPartner: {
        content: '具有成熟商业操守和强大变现能力的销售掌舵人，能够把实验室里的AI黑科技变成财务报表上的真金白银。',
        partnerTraits: ['在头部SaaS/IT外企有10年以上战功', '极强商业信誉与领导力'],
        collaborationScenarios: ['作为合伙人带队被投AI公司商业化', '共同设立企业智能化落地合资公司'],
        tags: ['SaaS', 'BD拓展', '大客户人脉']
      }
    }
  },
  {
    id: 'cand-gutiancheng',
    name: '顾天成',
    title: '智慧供应链与智能制造事业部总经理',
    company: '浪潮数字企业 (Inspur Digital Enterprise)',
    industry: '制造业 / 物流供应链',
    city: '济南 / 北京',
    yearsOfExperience: '13年',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    phone: '+86 136-2188-4450',
    profile: {
      name: '顾天成',
      title: '总经理',
      company: '浪潮数字企业',
      industry: '制造业 / 物流供应链',
      city: '济南',
      yearsOfExperience: '13年',
      capability: {
        content: '我精通工业互联网平台架构与高端离散制造数字中台建设，带领百人交付团队支撑数亿元国家级智能制造示范基地。手握大型重工国企核心软件采购总包资质。',
        highlights: ['主导国家级工业互联网双跨平台建设', '年中标重大政企集成标的超2亿元', '获省部级科技进步二等奖'],
        tags: ['技术研发', '战略规划', '团队管理', '供应链管理']
      },
      resources: {
        content: '掌握全国性大型装备制造国企采购通路、各省市工信厅产业升级白名单入围资源。',
        items: [
          { type: '政府与行业', desc: '工信部产业示范基地主要承建方' },
          { type: '大客渠道', desc: '50+大型重工制造国企核心IT供应商' }
        ],
        scale: '年承接总集成项目规模数亿元',
        tags: ['政府关系', '大客户人脉', '渠道网络']
      },
      endorsement: {
        content: '大型IT集团核心事业部掌门人，国家智能制造专家库成员，承建多项大国重器数字化项目。',
        highlights: ['年签2亿+总集成项目', '国家双跨平台核心操盘手', '省部级科技大奖获得者'],
        summary: '工业数字化总集成领军人',
        tags: ['制造业', '企业服务']
      },
      intent: {
        content: '【我能提供】国企总集成标段资质、庞大硬件与基础软件生态及总包投标通道。\n【我在寻找】在特定细分领域具备极致产品力和快速开发能力的SaaS与AI伙伴，丰富我方总集成解决方案。',
        seeking: ['具备差异化优势的企业级SaaS产品', '懂政企规则的高效联合体伙伴', '工业大模型与预测性维护算法'],
        offering: ['总承包商标段分包与集成准入', '北方广阔制造业大客户资源', '国家级试点项目联合申报'],
        supplyTags: ['大客户人脉', '政府关系', '渠道网络'],
        demandTags: ['SaaS', '技术研发', '产品设计'],
        tags: ['联合开发', '渠道分销', '资源互换']
      },
      taboo: {
        content: '拒绝无国资投标合规资质或有不良征信记录的企业；拒绝现场交付时掉链子中途违约的团队。',
        items: ['资质不全无背书', '中途毁约弃标', '违规违法投标'],
        tags: ['资质瑕疵', '履约违约', '恶意竞争'],
        keywords: ['资质不全', '违约', '弃标', '乱来']
      },
      idealPartner: {
        content: '懂大B端商务规则、交付守信且产品力扎实的SaaS商业化领军人，能够迅速协同形成高水平投标方案。',
        partnerTraits: ['有多年国企大客打单经验', '成熟的商务推进节奏感与契约精神'],
        collaborationScenarios: ['作为核心分包商入围央企采购清单', '共同成立工业AI联合创新实验室'],
        tags: ['BD拓展', 'SaaS', '大客户人脉']
      }
    }
  },
  {
    id: 'cand-xuruobing',
    name: '徐若冰',
    title: '创始人兼CEO',
    company: '声灵智汇 (VocalMatrix) 智能出海',
    industry: '跨境电商 / 人工智能',
    city: '上海',
    yearsOfExperience: '8年',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    phone: '+86 185-1622-0931',
    profile: {
      name: '徐若冰',
      title: '创始人兼CEO',
      company: '声灵智汇 (VocalMatrix)',
      industry: '跨境电商 / 人工智能',
      city: '上海',
      yearsOfExperience: '8年',
      capability: {
        content: '我深耕多语种实时语音与文字AI Agent领域，打造了服务海外8000+跨境商家的自动化运营矩阵，客户留存率84%，支持78种语言低延迟交互。',
        highlights: ['服务8000+全球商户，ARR突破400万美元', '获红杉种子基金与高瓴创投早期支持', '团队获AI全球创客大赛金奖'],
        tags: ['产品设计', '国际化', '人工智能', '增长策略']
      },
      resources: {
        content: '拥有覆盖北美、中东及东南亚的跨境独立站与海外社媒网红流量库，以及顶尖的国际化声学与大模型团队。',
        items: [
          { type: '海外渠道', desc: '覆盖20+国家和地区的海外渠道商网络' },
          { type: '产品矩阵', desc: '支持78种语言低延迟交互的AI Agent中台' }
        ],
        scale: '年处理跨境多语种商务互动逾亿次',
        tags: ['海外渠道', '技术团队', '媒体资源']
      },
      endorsement: {
        content: '斯坦福大学人机交互硕士，前字节跳动海外商业化产品负责人，福布斯亚洲Under 30。',
        highlights: ['前字节海外商业化核心骨干', 'ARR 400万美元高增长', '福布斯亚洲30U30'],
        summary: '跨境AI出海领军人，ARR 400万刀',
        tags: ['跨境电商', '国际化']
      },
      intent: {
        content: '【我能提供】高度成熟的多语种AI智能体产品矩阵、海外出海成熟打法及全球渠道网络。\n【我在寻找】熟悉国内中资出海企业大客户、拥有成熟B端销售铁军的渠道掌舵人，联合开发国内中资出海政企市场。',
        seeking: ['中资央国企出海大客户资源拥有者', '有成熟大客直销与渠道架构经验的老将', '国内出海跨境供应链品牌'],
        offering: ['高ARR分成比例', '联合品牌出海企服解决方案代理权', '多语种AI智能体底层能力'],
        supplyTags: ['国际化', '人工智能', '产品设计'],
        demandTags: ['大客户人脉', '渠道网络', 'BD拓展'],
        tags: ['渠道分销', '联合运营', '品牌联名']
      },
      taboo: {
        content: '拒绝无合规跨境资质的项目，拒绝恶性窃取核心客户数据的中介，拒绝不履行分成承诺的合作方。',
        items: ['数据安全合规漏洞', '私下飞单截流', '分成拖欠违约'],
        tags: ['数据泄露', '飞单中介', '拖欠分成'],
        keywords: ['飞单', '截流', '拖欠分成', '数据违规']
      },
      idealPartner: {
        content: '拥有丰富国企央企海外事业部人脉的B2B商业领军人，能将国际化前沿AI产品无缝引入大型出海集团采购流程。',
        partnerTraits: ['深耕出海央企与大型装备制造企业', '有体系化的政企商务推进能力'],
        collaborationScenarios: ['中资出海企业智能客服与合规Agent联合投标', '设立出海企服联合事业部'],
        tags: ['国际化', 'BD拓展', '大客户人脉']
      }
    }
  },
  {
    id: 'cand-luweiyuan',
    name: '陆唯远',
    title: '商业化副总裁 / 院端准入合伙人',
    company: '康宁数智（上海）医疗科技有限公司',
    industry: '医疗健康 / 生物医药',
    city: '上海',
    yearsOfExperience: '13年',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80',
    phone: '+86 138-1823-9042',
    profile: {
      name: '陆唯远',
      title: '商业化副总裁',
      company: '康宁数智医疗科技',
      industry: '医疗健康 / 生物医药',
      city: '上海',
      yearsOfExperience: '13年',
      capability: {
        content: '我精通医疗三类器械与医疗AI数字疗法在全国三甲医院的物价准入、医保收费与院端招投标全流程。主导过两款国家创新医疗器械绿色通道入围及进院放量。',
        highlights: ['覆盖华东与华南120家头部三甲医院进院准入', '年带动创新医疗软件设备进院销售额1.2亿元', '精通NMPA注册与医保物价编码申报'],
        tags: ['BD拓展', '政府关系', '团队管理', '医疗健康']
      },
      resources: {
        content: '掌握全国头部三甲医院放射科/心血管科主任级专家网络、省级卫健委智慧医院评级专家库。',
        items: [
          { type: '医院院端渠道', desc: '120家三甲医院器械与信息科核心采购决策人' },
          { type: '专家学会', desc: '中华医学会放射与影像分会常务委员合作渠道' }
        ],
        scale: '直通百家三甲医院千万级数字化采购通道',
        tags: ['大客户人脉', '政府关系', '渠道网络']
      },
      endorsement: {
        content: '前美敦力(Medtronic)大中华区销售总监，操盘过数款全球首创医疗器械在华商业化落地。',
        highlights: ['前外企500强销售总监', '两项三类创新证物价进院成功案例', '年销售额破亿'],
        summary: '13年医疗院端准入与商业化大将',
        tags: ['知名雇主', '大客户人脉']
      },
      intent: {
        content: '【我能提供】全国三甲医院顶尖专家网络、极速院端物价立项与进院招投标操盘能力。\n【我在寻找】在AI辅助诊疗、手术机器人、病理大模型或数字疗法具备核心原创算法专利的研发技术团队。',
        seeking: ['具备NMPA申报潜力的前沿医疗AI算法团队', '需要院端商业化销售与合规准入的研发型企业'],
        offering: ['全国院端经销网络与物价准入辅导', '百家三甲医院临床多中心验证试验支持'],
        supplyTags: ['大客户人脉', '政府关系', '渠道分销', 'BD拓展'],
        demandTags: ['技术研发', '人工智能', '产品设计', '高校科研'],
        tags: ['渠道分销', '联合开发', '技术合作']
      },
      taboo: {
        content: '严禁临床数据造假、无科研伦理审查的违规产品；拒绝商业贿赂或违背医疗反腐红线的灰色操作。',
        items: ['临床数据不真实造假', '触碰医疗反腐红线', '无科研伦理许可'],
        tags: ['合规红线', '数据造假', '法律风险'],
        keywords: ['造假', '带金销售', '行贿', '伦理问题']
      },
      idealPartner: {
        content: '拥有清北复交医学院背景或海外归国的顶尖算法科学家，专注解决真实临床痛点，产品力经得起双盲临床试验检验。',
        partnerTraits: ['算法技术扎实且追求严谨循证医学证据', '诚心让利商业化合伙人并全力支持技术迭代'],
        collaborationScenarios: ['作为商业化合伙人入股并统筹全国进院分销', '联合申报科技部重大诊疗研发专项'],
        tags: ['人工智能', '技术研发', '高校科研']
      }
    }
  },
  {
    id: 'cand-tangjincheng',
    name: '唐锦程',
    title: 'Web3与数字资产底层协议架构师',
    company: 'Nexus Decentralized Labs (新加坡/深圳)',
    industry: '金融科技 / 区块链 / Web3',
    city: '深圳',
    yearsOfExperience: '8年',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
    phone: '+86 139-2849-0128',
    profile: {
      name: '唐锦程',
      title: 'Web3协议架构师',
      company: 'Nexus Labs',
      industry: '金融科技 / 区块链',
      city: '深圳',
      yearsOfExperience: '8年',
      capability: {
        content: '我精通Solana、以太坊Layer2及智能合约微架构，曾主导设计TVL超1.5亿美元的去中心化撮合交易协议与代币经济模型，精通链上高频结算与抗MEV设计。',
        highlights: ['主导协议TVL峰值破1.5亿美元', '通过CertiK与OpenZeppelin多轮零漏洞审计', '开源工具获Github 4000+ Star'],
        tags: ['技术研发', '金融科技', '产品设计', '团队管理']
      },
      resources: {
        content: '我拥有海外头部Crypto基金、Solana生态基金核心生态负责人关系，以及数十万全球去中心化社群开发者人脉。',
        items: [
          { type: '海外生态基金', desc: '直通Jump Crypto、Solana Foundation生态资助' },
          { type: '链上开发者', desc: '覆盖全球数万智能合约工程师社群' }
        ],
        scale: '日链上处理交易结算量超千万美元',
        tags: ['投融资圈', '海外渠道', '技术团队']
      },
      endorsement: {
        content: '前全球Top3数字资产交易所高级架构师，Solana黑客松全球赛道冠军，知名Web3协议核心贡献者。',
        highlights: ['全球顶级交易所前核心架构师', 'Solana黑客松全球冠军', 'TVL 1.5亿美元项目操盘'],
        summary: 'Web3与智能合约顶级架构操盘手',
        tags: ['知名雇主', '技术研发']
      },
      intent: {
        content: '【我能提供】安全高并发智能合约底座、Web3钱包与代币化结算架构搭建、海外Crypto生态资本对接。\n【我在寻找】深耕实体产业、跨境商贸或拥有海量现实世界资产(RWA)及实体商业场景的操盘手。',
        seeking: ['拥有真实实体产业贸易流场景的商业伙伴', '跨境电商/供应链金融/知识产权RWA资产方'],
        offering: ['企业级Web3资产代币化底层架构', '海外Web3资本对接与代币经济模型设计'],
        supplyTags: ['技术研发', '金融科技', '国际化'],
        demandTags: ['供应链管理', '大客户人脉', '跨境电商'],
        tags: ['技术合作', '联合开发', '投资孵化']
      },
      taboo: {
        content: '严词拒绝纯资金盘庞氏骗局、匿名空气币跑路项目、以及无合规执照的非法集资行为。',
        items: ['资金盘庞氏骗局', '无技术沉淀的纯炒作空气币', '洗钱合规风险项目'],
        tags: ['金融欺诈', '合规风险', '传销盘'],
        keywords: ['资金盘', '杀猪盘', '传销', '洗钱', '跑路']
      },
      idealPartner: {
        content: '拥有扎实现金流和传统产业深厚根基的企业家，能够把链上技术真正用在降低跨境贸易信任成本与资产流动性提升上。',
        partnerTraits: ['拥有成熟的实体产业上下游贸易链条', '合法合规意识强，具备长远格局'],
        collaborationScenarios: ['跨境供应链数字仓单与智能合约联合结算', '实体资产RWA代币化联合运营'],
        tags: ['供应链管理', '跨境电商', '国际化']
      }
    }
  },
  {
    id: 'cand-wenqianyu',
    name: '温倩语',
    title: '流量合伙人 / MCN内容操盘总监',
    company: '星芒聚力（广州）文化传媒有限公司',
    industry: '文娱传媒 / 新零售',
    city: '广州',
    yearsOfExperience: '9年',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+86 186-2001-5582',
    profile: {
      name: '温倩语',
      title: '流量合伙人',
      company: '星芒聚力文化传媒',
      industry: '文娱传媒 / 新零售',
      city: '广州',
      yearsOfExperience: '9年',
      capability: {
        content: '我统筹全网短视频与直播带货矩阵，签约孵化80+垂类知识与生活方式博主，全网总粉丝量超6500万，年带货GMV突破3.2亿元。',
        highlights: ['单场爆款直播破1200万元GMV', '打造过多款从0到百万月销的新消费黑马品牌', '精通千川投流与自然流放大机制'],
        tags: ['内容运营', '品牌营销', '增长策略', '团队管理']
      },
      resources: {
        content: '掌控抖音、快手、小红书平台一手流量扶持绿色通道，以及200+头部主播联合坑位带货网络。',
        items: [
          { type: 'KOL矩阵', desc: '80+独家签约达人与千位外部合作主播库' },
          { type: '平台资源', desc: '抖音与小红书S级电商大促官方服务商通道' }
        ],
        scale: '日均全网内容播放量超8000万次',
        tags: ['KOL/达人', '媒体资源', '渠道网络']
      },
      endorsement: {
        content: '前辛选/无忧传媒资深运营总监，新榜年度最佳商业化MCN合伙人，操盘过多项千万级品效合一案例。',
        highlights: ['前头部MCN资深业务总监', '年度带货3.2亿战功', '新榜年度MCN领军操盘手'],
        summary: '6500万粉丝流量池，带货3.2亿操盘手',
        tags: ['KOL/达人', '品牌营销']
      },
      intent: {
        content: '【我能提供】全网数千万级精准年轻消费群体曝光、头部直播间带货席位、爆款短视频种草全案打法。\n【我在寻找】拥有高毛利、强复购、产品体验惊艳的新锐科技消费品、健康食品或国潮美妆源头品牌方。',
        seeking: ['源头优质爆品品牌方', '具备高复购率与良好毛利的创新消费品', '愿意深度绑定的联合运营品牌'],
        offering: ['千万级达人矩阵联合带货', '爆款内容短视频孵化与品效合一投放', '联名品牌孵化支持'],
        supplyTags: ['KOL/达人', '内容运营', '品牌营销', '渠道网络'],
        demandTags: ['供应链管理', '消费品', '产品设计'],
        tags: ['品牌联名', '联合运营', '渠道分销']
      },
      taboo: {
        content: '拒绝三无劣质产品、无质检合格证书的虚假宣传保健品；拒绝合作中随意跳单或克扣达人分成的品牌。',
        items: ['无资质劣质产品', '虚假功效宣传', '恶意跳单拖欠佣金'],
        tags: ['品控劣质', '虚假宣传', '跳单失信'],
        keywords: ['假货', '劣质', '虚假夸大', '赖账', '跳单']
      },
      idealPartner: {
        content: '专注极致产品打磨的匠人型创始人，产品品质与售后极其过硬，能够提供稳定现货供应，懂流量价值并诚意让利。',
        partnerTraits: ['产品品质过硬，售后差评率低于1%', '具备稳定的柔性供应链支持'],
        collaborationScenarios: ['作为核心主推品牌包销年度数千万元货品', '联合打造联名子品牌'],
        tags: ['消费品', '供应链管理', '产品设计']
      }
    }
  }
];
