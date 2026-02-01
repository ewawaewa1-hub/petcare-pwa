
import { TaskType } from './types';

export const DEFAULT_TASK_TYPES: TaskType[] = [
  { id: '1', name: '体重', color: '#f97316', icon: 'fa-solid fa-weight-scale', cycleDays: null, isDefault: true, hasValue: true, valueName: '体重 (kg)' },
  { id: '2', name: '看医生', color: '#ef4444', icon: 'fa-solid fa-stethoscope', cycleDays: 180, isDefault: true, hasValue: false },
  { id: '3', name: '驱虫', color: '#10b981', icon: 'fa-solid fa-shield-virus', cycleDays: 30, isDefault: true, hasValue: false },
  { id: '4', name: '洗澡', color: '#8b5cf6', icon: 'fa-solid fa-bath', cycleDays: 30, isDefault: true, hasValue: false },
  { id: '5', name: '剪指甲', color: '#ec4899', icon: 'fa-solid fa-hand-scissors', cycleDays: 21, isDefault: true, hasValue: false },
];

export const AVAILABLE_ICONS = [
  'fa-solid fa-weight-scale', 'fa-solid fa-stethoscope', 'fa-solid fa-shield-virus', 'fa-solid fa-bath', 
  'fa-solid fa-hand-scissors', 'fa-solid fa-bowl-food', 'fa-solid fa-pills', 'fa-solid fa-syringe',
  'fa-solid fa-house-chimney-medical', 'fa-solid fa-bone', 'fa-solid fa-fish-fins', 'fa-solid fa-bandage',
  'fa-solid fa-baseball', 'fa-solid fa-bed', 'fa-solid fa-broom', 'fa-solid fa-bug', 
  'fa-solid fa-camera', 'fa-solid fa-heart'
];

export const CAT_BREEDS = [
  '中华田园猫', '狸花猫', '三花猫', '奶牛猫', '玄猫', '橘猫', '白猫', '临清狮子猫',
  '阿比西尼亚猫', '布偶猫', '德文卷毛猫', '俄罗斯蓝猫', '加拿大无毛猫', '金吉拉', 
  '缅因猫', '美国短毛猫', '孟买猫', '挪威森林猫', '暹罗猫', '英国短毛猫', '异国短毛猫',
  '巴厘猫', '伯曼猫', '东方短毛猫', '东奇尼猫', '埃及猫', '哈瓦那棕猫', '柯尼斯卷毛猫', 
  '拉波卷毛猫', '美国卷耳猫', '美国短尾猫', '美国刚毛猫', '曼基康猫', '日本短尾猫', 
  '塞尔凯克卷毛猫', '苏格兰折耳猫', '索马里猫', '土耳其安哥拉猫', '土耳其梵猫', '新加坡猫'
];

export const DOG_BREEDS = [
  '中华田园犬', '金毛寻回犬', '拉布拉多', '哈士奇', '萨摩耶', '柯基', '柴犬', '边境牧羊犬', 
  '泰迪', '贵宾犬', '博美', '比熊', '阿拉斯加', '德国牧羊犬', '秋田犬', '雪纳瑞', '巴哥犬', 
  '法斗', '英斗', '吉娃娃', '可卡', '喜乐蒂', '松狮', '斑点狗', '杜宾', '罗威纳'
];

export const THEME_COLORS = [
  '#FCA5A5', '#FDBA74', '#FCD34D', '#BEF264', '#6EE7B7', '#67E8F9', '#93C5FD', '#A5B4FC', '#C4B5FD', '#F9A8D4'
];

export const DEFAULT_USER_AVATAR = 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix';
export const DEFAULT_CAT_AVATAR = 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Mimi&backgroundColor=b6e3f4';
export const DEFAULT_DOG_AVATAR = 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Lucky&backgroundColor=ffdfbf';
export const DEFAULT_OTHER_AVATAR = 'https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=Bunny&backgroundColor=d1d4db';
