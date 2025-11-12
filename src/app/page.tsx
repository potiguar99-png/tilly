'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Clock, TrendingUp, Baby, Heart, Trash2, Calendar, Milk, Droplet, Camera, User, Weight, Ruler, Plus, X, Check, Bell, Coffee, Activity, BookOpen, Smile, AlertCircle, Edit2, ChevronRight, BarChart3, Timer, Utensils, Pill, Sparkles, Crown, Lock } from 'lucide-react'

// Interfaces
interface BabyProfile {
  name: string
  photo?: string
  birthDate: string
  gender: 'boy' | 'girl'
}

interface GrowthRecord {
  id: string
  date: string
  weight: number // kg
  height: number // cm
  age: number // meses
}

interface FeedingRecord {
  id: string
  date: string
  time: string
  type: 'breast' | 'formula' | 'both'
  amount?: number // ml
  duration?: number // minutos (para amamentação)
  side?: 'left' | 'right' | 'both' // para amamentação
  notes?: string
}

interface SleepRecord {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number // minutos
  type: 'nap' | 'night'
  quality?: 'excellent' | 'good' | 'fair' | 'poor'
  wakeUps?: number
  notes?: string
}

interface FeedingRoutine {
  ageMonths: number
  breastFeedings: number
  formulaAmount: number // ml por dia
  interval: number // horas entre mamadas
  nightFeedings: number
}

interface BabyObservation {
  id: string
  date: string
  smiles: boolean
  cries: boolean
  colic: boolean
  sleepsWell: boolean
  eatsWell: boolean
  active: boolean
  calm: boolean
  fussy: boolean
  notes: string
}

interface Medicine {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
  purpose: string
  notes?: string
}

interface Subscription {
  isActive: boolean
  isPremium: boolean
  trialEndsAt: string | null
  subscriptionType: 'monthly' | 'yearly' | null
}

export default function BabyCompanionApp() {
  // Estados principais
  const [activeTab, setActiveTab] = useState<'profile' | 'feeding' | 'sleep' | 'growth' | 'routine' | 'observations' | 'medicines'>('profile')
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null)
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([])
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([])
  const [observations, setObservations] = useState<BabyObservation[]>([])
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [subscription, setSubscription] = useState<Subscription>({
    isActive: false,
    isPremium: false,
    trialEndsAt: null,
    subscriptionType: null
  })
  
  // Estados de modais
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showGrowthForm, setShowGrowthForm] = useState(false)
  const [showFeedingForm, setShowFeedingForm] = useState(false)
  const [showSleepForm, setShowSleepForm] = useState(false)
  const [showObservationForm, setShowObservationForm] = useState(false)
  const [showMedicineForm, setShowMedicineForm] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  
  // Estados de tracking
  const [isTrackingFeeding, setIsTrackingFeeding] = useState(false)
  const [feedingStartTime, setFeedingStartTime] = useState<string | null>(null)
  const [feedingDuration, setFeedingDuration] = useState(0)
  const [isTrackingSleep, setIsTrackingSleep] = useState(false)
  const [sleepStartTime, setSleepStartTime] = useState<string | null>(null)
  const [sleepDuration, setSleepDuration] = useState(0)

  // Estados do formulário de alimentação
  const [feedingFormType, setFeedingFormType] = useState<'breast' | 'formula' | 'both'>('breast')
  const [feedingFormDuration, setFeedingFormDuration] = useState('')
  const [feedingFormAmount, setFeedingFormAmount] = useState('')
  const [feedingFormSide, setFeedingFormSide] = useState<'left' | 'right' | 'both'>('left')

  // Estados do formulário de sono
  const [sleepFormType, setSleepFormType] = useState<'nap' | 'night'>('nap')
  const [sleepFormStartTime, setSleepFormStartTime] = useState('')
  const [sleepFormEndTime, setSleepFormEndTime] = useState('')
  const [sleepFormDuration, setSleepFormDuration] = useState('')

  // Cores dinâmicas baseadas no gênero
  const getThemeColors = () => {
    if (!babyProfile) return {
      primary: 'purple',
      secondary: 'pink',
      gradient: 'from-pink-500 to-purple-500',
      gradientBg: 'from-pink-100 via-purple-100 to-blue-100',
      light: 'purple-50',
      border: 'purple-100'
    }
    
    if (babyProfile.gender === 'boy') {
      return {
        primary: 'blue',
        secondary: 'cyan',
        gradient: 'from-blue-500 to-cyan-500',
        gradientBg: 'from-blue-100 via-cyan-100 to-sky-100',
        light: 'blue-50',
        border: 'blue-100'
      }
    } else {
      return {
        primary: 'pink',
        secondary: 'rose',
        gradient: 'from-pink-500 to-rose-500',
        gradientBg: 'from-pink-100 via-rose-100 to-purple-100',
        light: 'pink-50',
        border: 'pink-100'
      }
    }
  }

  const theme = getThemeColors()

  // Verificar trial e assinatura
  useEffect(() => {
    const savedSubscription = localStorage.getItem('subscription')
    if (savedSubscription) {
      const sub = JSON.parse(savedSubscription)
      setSubscription(sub)
    } else {
      // Iniciar trial de 5 dias
      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 5)
      const newSub: Subscription = {
        isActive: true,
        isPremium: false,
        trialEndsAt: trialEnd.toISOString(),
        subscriptionType: null
      }
      setSubscription(newSub)
      localStorage.setItem('subscription', JSON.stringify(newSub))
    }
  }, [])

  // Verificar se trial expirou
  useEffect(() => {
    if (subscription.trialEndsAt && !subscription.isPremium) {
      const trialEnd = new Date(subscription.trialEndsAt)
      const now = new Date()
      if (now > trialEnd) {
        setSubscription({ ...subscription, isActive: false })
        setShowSubscriptionModal(true)
      }
    }
  }, [subscription])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('babyProfile')
    const savedGrowth = localStorage.getItem('growthRecords')
    const savedFeeding = localStorage.getItem('feedingRecords')
    const savedSleep = localStorage.getItem('sleepRecords')
    const savedObservations = localStorage.getItem('observations')
    const savedMedicines = localStorage.getItem('medicines')
    
    if (savedProfile) setBabyProfile(JSON.parse(savedProfile))
    if (savedGrowth) setGrowthRecords(JSON.parse(savedGrowth))
    if (savedFeeding) setFeedingRecords(JSON.parse(savedFeeding))
    if (savedSleep) setSleepRecords(JSON.parse(savedSleep))
    if (savedObservations) setObservations(JSON.parse(savedObservations))
    if (savedMedicines) setMedicines(JSON.parse(savedMedicines))
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    if (babyProfile) localStorage.setItem('babyProfile', JSON.stringify(babyProfile))
  }, [babyProfile])

  useEffect(() => {
    if (growthRecords.length > 0) localStorage.setItem('growthRecords', JSON.stringify(growthRecords))
  }, [growthRecords])

  useEffect(() => {
    if (feedingRecords.length > 0) localStorage.setItem('feedingRecords', JSON.stringify(feedingRecords))
  }, [feedingRecords])

  useEffect(() => {
    if (sleepRecords.length > 0) localStorage.setItem('sleepRecords', JSON.stringify(sleepRecords))
  }, [sleepRecords])

  useEffect(() => {
    if (observations.length > 0) localStorage.setItem('observations', JSON.stringify(observations))
  }, [observations])

  useEffect(() => {
    if (medicines.length > 0) localStorage.setItem('medicines', JSON.stringify(medicines))
  }, [medicines])

  useEffect(() => {
    localStorage.setItem('subscription', JSON.stringify(subscription))
  }, [subscription])

  // Timer para amamentação
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTrackingFeeding && feedingStartTime) {
      interval = setInterval(() => {
        const start = new Date(feedingStartTime).getTime()
        const now = new Date().getTime()
        setFeedingDuration(Math.floor((now - start) / 1000 / 60))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTrackingFeeding, feedingStartTime])

  // Timer para sono
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTrackingSleep && sleepStartTime) {
      interval = setInterval(() => {
        const start = new Date(sleepStartTime).getTime()
        const now = new Date().getTime()
        setSleepDuration(Math.floor((now - start) / 1000 / 60))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTrackingSleep, sleepStartTime])

  // Funções auxiliares
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return months
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const getFeedingRecommendation = (ageMonths: number): FeedingRoutine => {
    if (ageMonths <= 1) {
      return { ageMonths, breastFeedings: 8-12, formulaAmount: 600-900, interval: 2-3, nightFeedings: 2-3 }
    } else if (ageMonths <= 3) {
      return { ageMonths, breastFeedings: 7-9, formulaAmount: 750-1000, interval: 3-4, nightFeedings: 1-2 }
    } else if (ageMonths <= 6) {
      return { ageMonths, breastFeedings: 5-7, formulaAmount: 800-1000, interval: 4, nightFeedings: 0-1 }
    } else if (ageMonths <= 12) {
      return { ageMonths, breastFeedings: 4-6, formulaAmount: 600-800, interval: 4-5, nightFeedings: 0 }
    } else if (ageMonths <= 24) {
      return { ageMonths, breastFeedings: 2-4, formulaAmount: 400-600, interval: 5-6, nightFeedings: 0 }
    } else {
      return { ageMonths, breastFeedings: 0-2, formulaAmount: 300-500, interval: 6-8, nightFeedings: 0 }
    }
  }

  const getSmartSuggestions = () => {
    if (observations.length === 0) return []
    
    const latestObs = observations[0]
    const suggestions: string[] = []

    if (latestObs.colic) {
      suggestions.push('💆 Massagem na barriguinha em movimentos circulares pode aliviar cólicas')
      suggestions.push('🤱 Amamente em posição mais vertical para reduzir gases')
      suggestions.push('🌡️ Compressa morna na barriga ajuda a relaxar')
    }

    if (latestObs.cries) {
      suggestions.push('👶 Verifique se o bebê está com fome, fralda suja ou desconforto')
      suggestions.push('🎵 Sons brancos ou música suave podem acalmar')
      suggestions.push('🤗 Contato pele a pele traz segurança e conforto')
    }

    if (!latestObs.sleepsWell) {
      suggestions.push('🌙 Estabeleça uma rotina de sono consistente')
      suggestions.push('🛁 Banho morno antes de dormir relaxa o bebê')
      suggestions.push('🌡️ Mantenha o quarto entre 18-21°C')
    }

    if (!latestObs.eatsWell) {
      suggestions.push('🍼 Ofereça mamadas em ambiente calmo e sem distrações')
      suggestions.push('⏰ Respeite os sinais de fome do bebê')
      suggestions.push('👩‍⚕️ Consulte o pediatra se a recusa persistir')
    }

    if (latestObs.fussy) {
      suggestions.push('🚶 Caminhadas ou balanço suave podem acalmar')
      suggestions.push('🧸 Chupeta ou objeto de conforto pode ajudar')
      suggestions.push('💤 Bebê irritado pode estar cansado - tente colocá-lo para dormir')
    }

    if (latestObs.smiles && latestObs.active) {
      suggestions.push('✨ Seu bebê está se desenvolvendo muito bem!')
      suggestions.push('🎉 Continue estimulando com brincadeiras e interação')
    }

    return suggestions
  }

  const getMedicineRecommendations = () => {
    if (observations.length === 0) return []
    
    const latestObs = observations[0]
    const recommendations: { name: string; purpose: string; note: string }[] = []

    if (latestObs.colic) {
      recommendations.push({
        name: 'Simeticona (Luftal)',
        purpose: 'Alívio de gases e cólicas',
        note: '⚠️ Consulte o pediatra para dosagem correta'
      })
      recommendations.push({
        name: 'Probióticos infantis',
        purpose: 'Melhora da flora intestinal',
        note: '⚠️ Recomendado por pediatra'
      })
    }

    if (!latestObs.sleepsWell) {
      recommendations.push({
        name: 'Camomila (chá fraco)',
        purpose: 'Relaxamento natural',
        note: '⚠️ Apenas após 6 meses e com aprovação médica'
      })
    }

    if (latestObs.cries && latestObs.fussy) {
      recommendations.push({
        name: 'Vitamina D',
        purpose: 'Desenvolvimento ósseo e bem-estar',
        note: '✅ Geralmente recomendado por pediatras'
      })
    }

    return recommendations
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBabyProfile({ ...babyProfile!, photo: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const startFeedingTracking = () => {
    setFeedingStartTime(new Date().toISOString())
    setIsTrackingFeeding(true)
    setFeedingDuration(0)
  }

  const stopFeedingTracking = () => {
    setIsTrackingFeeding(false)
    setFeedingFormDuration(feedingDuration.toString())
    setShowFeedingForm(true)
  }

  const startSleepTracking = () => {
    setSleepStartTime(new Date().toISOString())
    setIsTrackingSleep(true)
    setSleepDuration(0)
  }

  const stopSleepTracking = () => {
    setIsTrackingSleep(false)
    setSleepFormDuration(sleepDuration.toString())
    const now = new Date()
    const start = new Date(sleepStartTime!)
    setSleepFormStartTime(start.toTimeString().slice(0, 5))
    setSleepFormEndTime(now.toTimeString().slice(0, 5))
    setShowSleepForm(true)
  }

  const getTodayFeedings = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    return feedingRecords.filter(r => r.date === today).length
  }

  const getTodaySleep = () => {
    const today = new Date().toLocaleDateString('pt-BR')
    return sleepRecords
      .filter(r => r.date === today)
      .reduce((total, r) => total + r.duration, 0)
  }

  const handleSaveFeedingRecord = () => {
    const newRecord: FeedingRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: feedingFormType,
      duration: feedingFormDuration ? parseInt(feedingFormDuration) : undefined,
      amount: feedingFormAmount ? parseInt(feedingFormAmount) : undefined,
      side: feedingFormType === 'breast' || feedingFormType === 'both' ? feedingFormSide : undefined
    }
    setFeedingRecords([newRecord, ...feedingRecords])
    setShowFeedingForm(false)
    // Reset form
    setFeedingFormType('breast')
    setFeedingFormDuration('')
    setFeedingFormAmount('')
    setFeedingFormSide('left')
    setFeedingDuration(0)
    setFeedingStartTime(null)
  }

  const handleSaveSleepRecord = () => {
    let duration = 0
    let startTime = ''
    let endTime = ''

    // Se tem duração manual, usar ela
    if (sleepFormDuration) {
      duration = parseInt(sleepFormDuration)
      
      // Se tem horários, usar eles
      if (sleepFormStartTime && sleepFormEndTime) {
        const today = new Date().toISOString().split('T')[0]
        startTime = `${today}T${sleepFormStartTime}:00`
        endTime = `${today}T${sleepFormEndTime}:00`
      } else {
        // Calcular horários baseado na duração
        const end = new Date()
        const start = new Date(end.getTime() - duration * 60000)
        startTime = start.toISOString()
        endTime = end.toISOString()
      }
    } 
    // Se tem horários mas não tem duração, calcular duração
    else if (sleepFormStartTime && sleepFormEndTime) {
      const today = new Date().toISOString().split('T')[0]
      const start = new Date(`${today}T${sleepFormStartTime}:00`)
      const end = new Date(`${today}T${sleepFormEndTime}:00`)
      duration = Math.floor((end.getTime() - start.getTime()) / 60000)
      startTime = start.toISOString()
      endTime = end.toISOString()
    }
    // Se não tem nada, usar valores padrão
    else {
      duration = 60
      const end = new Date()
      const start = new Date(end.getTime() - 60 * 60000)
      startTime = start.toISOString()
      endTime = end.toISOString()
    }

    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      startTime,
      endTime,
      duration,
      type: sleepFormType
    }

    setSleepRecords([newRecord, ...sleepRecords])
    setShowSleepForm(false)
    
    // Reset form
    setSleepFormType('nap')
    setSleepFormStartTime('')
    setSleepFormEndTime('')
    setSleepFormDuration('')
    setSleepDuration(0)
    setSleepStartTime(null)
  }

  const handleSubscribe = (type: 'monthly' | 'yearly') => {
    const newSub: Subscription = {
      isActive: true,
      isPremium: true,
      trialEndsAt: null,
      subscriptionType: type
    }
    setSubscription(newSub)
    setShowSubscriptionModal(false)
  }

  const getDaysLeftInTrial = () => {
    if (!subscription.trialEndsAt) return 0
    const trialEnd = new Date(subscription.trialEndsAt)
    const now = new Date()
    const diff = trialEnd.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  // Bloquear acesso se não tiver assinatura ativa
  const isLocked = !subscription.isActive && !subscription.isPremium

  // Se não tem perfil, mostrar onboarding
  if (!babyProfile) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.gradientBg} flex items-center justify-center p-4`}>
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${theme.gradient} rounded-full mb-4`}>
              <Baby className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent mb-2`}>
              Tilly - Acompanhando seu bebê
            </h1>
            <p className="text-gray-600">Vamos começar criando o perfil do seu bebê</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              5 dias grátis para testar!
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do bebê</label>
              <input
                type="text"
                placeholder="Digite o nome"
                className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                onChange={(e) => setBabyProfile({ ...babyProfile!, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de nascimento</label>
              <input
                type="date"
                className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                onChange={(e) => setBabyProfile({ ...babyProfile!, birthDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sexo</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'girl', label: 'Menina', icon: '👧', color: 'pink' },
                  { value: 'boy', label: 'Menino', icon: '👦', color: 'blue' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBabyProfile({ ...babyProfile!, gender: option.value as any })}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      babyProfile?.gender === option.value
                        ? `border-${option.color}-500 bg-${option.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{option.icon}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (babyProfile?.name && babyProfile?.birthDate && babyProfile?.gender) {
                  setActiveTab('profile')
                }
              }}
              disabled={!babyProfile?.name || !babyProfile?.birthDate || !babyProfile?.gender}
              className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Começar Jornada
            </button>
          </div>
        </div>
      </div>
    )
  }

  const babyAge = calculateAge(babyProfile.birthDate)
  const feedingRoutine = getFeedingRecommendation(babyAge)
  const suggestions = getSmartSuggestions()
  const medicineRecommendations = getMedicineRecommendations()

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradientBg}`}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {babyProfile.photo ? (
                  <img src={babyProfile.photo} alt={babyProfile.name} className={`w-12 h-12 rounded-full object-cover border-2 border-${theme.primary}-300`} />
                ) : (
                  <div className={`w-12 h-12 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center`}>
                    <Baby className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{babyProfile.name}</h1>
                <p className="text-sm text-gray-600">{babyAge} {babyAge === 1 ? 'mês' : 'meses'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!subscription.isPremium && subscription.trialEndsAt && (
                <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getDaysLeftInTrial()} dias restantes
                </div>
              )}
              {subscription.isPremium && (
                <div className={`bg-gradient-to-r ${theme.gradient} text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                  <Crown className="w-3 h-3" />
                  Premium
                </div>
              )}
              <button
                onClick={() => setShowProfileForm(true)}
                className={`p-2 hover:bg-${theme.light} rounded-lg transition-colors`}
              >
                <Edit2 className={`w-5 h-5 text-${theme.primary}-600`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={`bg-white rounded-xl p-4 shadow-sm border border-${theme.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <Milk className={`w-4 h-4 text-${theme.primary}-600`} />
              <span className="text-xs text-gray-600">Hoje</span>
            </div>
            <p className={`text-2xl font-bold text-${theme.primary}-600`}>{getTodayFeedings()}</p>
            <p className="text-xs text-gray-500">mamadas</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-gray-600">Sono</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatDuration(getTodaySleep())}</p>
            <p className="text-xs text-gray-500">total</p>
          </div>

          <div className={`bg-white rounded-xl p-4 shadow-sm border border-${theme.border}`}>
            <div className="flex items-center gap-2 mb-2">
              <Weight className={`w-4 h-4 text-${theme.primary}-600`} />
              <span className="text-xs text-gray-600">Peso</span>
            </div>
            <p className={`text-2xl font-bold text-${theme.primary}-600`}>
              {growthRecords.length > 0 ? growthRecords[0].weight.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-gray-500">kg</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Altura</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {growthRecords.length > 0 ? growthRecords[0].height.toFixed(0) : '-'}
            </p>
            <p className="text-xs text-gray-500">cm</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-1 shadow-lg flex gap-1 overflow-x-auto">
          {[
            { id: 'profile', icon: User, label: 'Perfil' },
            { id: 'feeding', icon: Milk, label: 'Alimentação' },
            { id: 'sleep', icon: Moon, label: 'Sono' },
            { id: 'growth', icon: TrendingUp, label: 'Crescimento' },
            { id: 'observations', icon: Smile, label: 'Observações' },
            { id: 'medicines', icon: Pill, label: 'Remédios' },
            { id: 'routine', icon: BookOpen, label: 'Rotina' }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-[80px] py-3 px-2 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${theme.gradient} text-white shadow-md`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  {babyProfile.photo ? (
                    <img src={babyProfile.photo} alt={babyProfile.name} className={`w-32 h-32 rounded-full object-cover border-4 border-${theme.primary}-300`} />
                  ) : (
                    <div className={`w-32 h-32 bg-gradient-to-br ${theme.gradient} rounded-full flex items-center justify-center`}>
                      <Baby className="w-16 h-16 text-white" />
                    </div>
                  )}
                  <label className={`absolute bottom-0 right-0 p-2 bg-${theme.primary}-500 rounded-full cursor-pointer hover:bg-${theme.primary}-600 transition-colors`}>
                    <Camera className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{babyProfile.name}</h2>
                <p className="text-gray-600">{babyAge} {babyAge === 1 ? 'mês' : 'meses'} • {babyProfile.gender === 'girl' ? 'Menina' : 'Menino'}</p>
                <p className="text-sm text-gray-500 mt-2">Nascimento: {new Date(babyProfile.birthDate).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className={`bg-gradient-to-br from-${theme.light} to-${theme.light} rounded-xl p-4 border border-${theme.border}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className={`w-5 h-5 text-${theme.primary}-600`} />
                    <h3 className="font-semibold text-gray-800">Estatísticas</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de mamadas:</span>
                      <span className="font-semibold text-gray-800">{feedingRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registros de sono:</span>
                      <span className="font-semibold text-gray-800">{sleepRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Medições:</span>
                      <span className="font-semibold text-gray-800">{growthRecords.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Observações:</span>
                      <span className="font-semibold text-gray-800">{observations.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <h3 className="font-semibold text-gray-800">Desenvolvimento</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fase:</span>
                      <span className="font-semibold text-gray-800">
                        {babyAge <= 3 ? 'Recém-nascido' : babyAge <= 12 ? 'Bebê' : babyAge <= 24 ? 'Criança pequena' : 'Pré-escolar'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dias de vida:</span>
                      <span className="font-semibold text-gray-800">
                        {Math.floor((new Date().getTime() - new Date(babyProfile.birthDate).getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feeding Tab */}
        {activeTab === 'feeding' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                {/* Tracking Card */}
                {isTrackingFeeding ? (
                  <div className={`bg-gradient-to-br ${theme.gradient} rounded-2xl p-6 shadow-xl text-white`}>
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Amamentando...</span>
                      </div>
                      <div className="text-5xl font-bold mb-2">{formatDuration(feedingDuration)}</div>
                      <p className="text-white/80">Tempo decorrido</p>
                    </div>
                    <button
                      onClick={stopFeedingTracking}
                      className={`w-full bg-white text-${theme.primary}-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg`}
                    >
                      Finalizar Mamada
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startFeedingTracking}
                    className={`w-full bg-white rounded-2xl p-6 shadow-lg border-2 border-${theme.border} hover:border-${theme.primary}-400 transition-all group`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <div className={`p-3 bg-gradient-to-br ${theme.gradient} rounded-xl group-hover:scale-110 transition-transform`}>
                        <Timer className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-800">Iniciar Mamada</h3>
                        <p className="text-sm text-gray-600">Cronometrar amamentação</p>
                      </div>
                    </div>
                  </button>
                )}

                {/* Quick Add */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowFeedingForm(true)}
                    className={`bg-white rounded-xl p-4 shadow-sm border border-${theme.border} hover:border-${theme.primary}-300 transition-all`}
                  >
                    <Plus className={`w-6 h-6 text-${theme.primary}-600 mx-auto mb-2`} />
                    <p className="text-sm font-medium text-gray-800">Adicionar Mamada</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('routine')}
                    className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 hover:border-blue-300 transition-all"
                  >
                    <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-800">Ver Rotina</p>
                  </button>
                </div>

                {/* History */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Alimentação</h3>
                  {feedingRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Milk className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum registro ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {feedingRecords.slice(0, 10).map((record) => (
                        <div key={record.id} className={`flex items-center justify-between p-4 bg-${theme.light} rounded-xl border border-${theme.border}`}>
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-${theme.primary}-100 rounded-lg`}>
                              <Milk className={`w-5 h-5 text-${theme.primary}-600`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {record.type === 'breast' ? 'Peito' : record.type === 'formula' ? 'Fórmula' : 'Peito + Fórmula'}
                                {record.side && record.type !== 'formula' && ` (${record.side === 'left' ? 'Esquerdo' : record.side === 'right' ? 'Direito' : 'Ambos'})`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {record.time} • {record.date}
                                {record.duration && ` • ${record.duration}min`}
                                {record.amount && ` • ${record.amount}ml`}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setFeedingRecords(feedingRecords.filter(r => r.id !== record.id))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                {/* Tracking Card */}
                {isTrackingSleep ? (
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 shadow-xl text-white">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Dormindo...</span>
                      </div>
                      <div className="text-5xl font-bold mb-2">{formatDuration(sleepDuration)}</div>
                      <p className="text-white/80">Tempo de sono</p>
                    </div>
                    <button
                      onClick={stopSleepTracking}
                      className="w-full bg-white text-blue-600 py-4 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg"
                    >
                      Acordou
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <button
                      onClick={startSleepTracking}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all group"
                    >
                      <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform">
                        <Moon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Iniciar Sono</h3>
                      <p className="text-sm text-gray-600">Cronometrar sono</p>
                    </button>
                    <button
                      onClick={() => setShowSleepForm(true)}
                      className={`bg-white rounded-2xl p-6 shadow-lg border-2 border-${theme.border} hover:border-${theme.primary}-400 transition-all group`}
                    >
                      <div className={`p-3 bg-gradient-to-br ${theme.gradient} rounded-xl mx-auto w-fit mb-4 group-hover:scale-110 transition-transform`}>
                        <Plus className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Adicionar Sono</h3>
                      <p className="text-sm text-gray-600">Registro manual</p>
                    </button>
                  </div>
                )}

                {/* Today's Sleep */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Sono de Hoje</h3>
                  <div className="text-center py-6">
                    <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                      {formatDuration(getTodaySleep())}
                    </div>
                    <p className="text-gray-600">Total de sono</p>
                  </div>
                </div>

                {/* History */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Sono</h3>
                  {sleepRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum registro ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sleepRecords.slice(0, 10).map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {record.type === 'night' ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-orange-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {record.type === 'night' ? 'Sono Noturno' : 'Soneca'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatTime(record.startTime)} - {formatTime(record.endTime)} • {formatDuration(record.duration)}
                              </p>
                              <p className="text-xs text-gray-500">{record.date}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSleepRecords(sleepRecords.filter(r => r.id !== record.id))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Growth Tab */}
        {activeTab === 'growth' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowGrowthForm(true)}
                  className={`w-full bg-gradient-to-r ${theme.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
                >
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Adicionar Medição</p>
                </button>

                {growthRecords.length > 0 && (
                  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Última Medição</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`bg-${theme.light} rounded-xl p-4 border border-${theme.border}`}>
                        <Weight className={`w-6 h-6 text-${theme.primary}-600 mb-2`} />
                        <p className={`text-3xl font-bold text-${theme.primary}-600`}>{growthRecords[0].weight.toFixed(1)}</p>
                        <p className="text-sm text-gray-600">kg</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <Ruler className="w-6 h-6 text-green-600 mb-2" />
                        <p className="text-3xl font-bold text-green-600">{growthRecords[0].height.toFixed(0)}</p>
                        <p className="text-sm text-gray-600">cm</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Crescimento</h3>
                  {growthRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma medição ainda</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {growthRecords.map((record) => (
                        <div key={record.id} className={`flex items-center justify-between p-4 bg-gradient-to-r from-${theme.light} to-${theme.light} rounded-xl border border-${theme.border}`}>
                          <div>
                            <p className="font-medium text-gray-800">{record.age} {record.age === 1 ? 'mês' : 'meses'}</p>
                            <p className="text-sm text-gray-600">
                              {record.weight.toFixed(1)}kg • {record.height.toFixed(0)}cm
                            </p>
                            <p className="text-xs text-gray-500">{record.date}</p>
                          </div>
                          <button
                            onClick={() => setGrowthRecords(growthRecords.filter(r => r.id !== record.id))}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Observations Tab */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowObservationForm(true)}
                  className={`w-full bg-gradient-to-r ${theme.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
                >
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Adicionar Observação</p>
                </button>

                {/* Smart Suggestions */}
                {suggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border border-amber-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Sugestões Personalizadas</h3>
                    </div>
                    <div className="space-y-3">
                      {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl">
                          <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observations History */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Observações</h3>
                  {observations.length === 0 ? (
                    <div className="text-center py-12">
                      <Smile className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma observação ainda</p>
                      <p className="text-sm text-gray-400 mt-2">Adicione observações para receber sugestões personalizadas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {observations.map((obs) => (
                        <div key={obs.id} className={`p-4 bg-${theme.light} rounded-xl border border-${theme.border}`}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-600">{obs.date}</p>
                            <button
                              onClick={() => setObservations(observations.filter(o => o.id !== obs.id))}
                              className="p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                            {obs.smiles && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">😊 Sorri</span>}
                            {obs.cries && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">😢 Chora</span>}
                            {obs.colic && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">😣 Cólica</span>}
                            {obs.sleepsWell && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">😴 Dorme bem</span>}
                            {obs.eatsWell && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">🍼 Come bem</span>}
                            {obs.active && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">⚡ Ativo</span>}
                            {obs.calm && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">😌 Calmo</span>}
                            {obs.fussy && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">😤 Irritado</span>}
                          </div>
                          {obs.notes && (
                            <p className="text-sm text-gray-700 bg-white p-3 rounded-lg">{obs.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Medicines Tab */}
        {activeTab === 'medicines' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setShowMedicineForm(true)}
                  className={`w-full bg-gradient-to-r ${theme.gradient} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all`}
                >
                  <Plus className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-semibold">Adicionar Remédio</p>
                </button>

                {/* Medicine Recommendations */}
                {medicineRecommendations.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Recomendações Baseadas nas Observações</h3>
                    </div>
                    <div className="space-y-3">
                      {medicineRecommendations.map((rec, index) => (
                        <div key={index} className="p-4 bg-white rounded-xl border border-blue-100">
                          <div className="flex items-start gap-3">
                            <Pill className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{rec.name}</p>
                              <p className="text-sm text-gray-600 mt-1">{rec.purpose}</p>
                              <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-2 inline-block">{rec.note}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Medicines */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Remédios Ativos</h3>
                  {medicines.filter(m => !m.endDate || new Date(m.endDate) > new Date()).length === 0 ? (
                    <div className="text-center py-12">
                      <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhum remédio ativo</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medicines
                        .filter(m => !m.endDate || new Date(m.endDate) > new Date())
                        .map((medicine) => (
                          <div key={medicine.id} className={`p-4 bg-${theme.light} rounded-xl border border-${theme.border}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{medicine.purpose}</p>
                              </div>
                              <button
                                onClick={() => setMedicines(medicines.filter(m => m.id !== medicine.id))}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                              <div>
                                <p className="text-gray-500 text-xs">Dosagem</p>
                                <p className="font-medium text-gray-800">{medicine.dosage}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Frequência</p>
                                <p className="font-medium text-gray-800">{medicine.frequency}</p>
                              </div>
                            </div>
                            {medicine.notes && (
                              <p className="text-xs text-gray-600 bg-white p-2 rounded mt-2">{medicine.notes}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Medicine History */}
                {medicines.filter(m => m.endDate && new Date(m.endDate) <= new Date()).length > 0 && (
                  <div className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-200`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Remédios</h3>
                    <div className="space-y-3">
                      {medicines
                        .filter(m => m.endDate && new Date(m.endDate) <= new Date())
                        .map((medicine) => (
                          <div key={medicine.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 opacity-60">
                            <h4 className="font-semibold text-gray-800">{medicine.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{medicine.purpose}</p>
                            <p className="text-xs text-gray-500 mt-2">Finalizado em: {new Date(medicine.endDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Routine Tab */}
        {activeTab === 'routine' && (
          <div className="space-y-4">
            {isLocked ? (
              <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Período de teste encerrado</h3>
                <p className="text-gray-600 mb-6">Assine para continuar acompanhando seu bebê</p>
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className={`bg-gradient-to-r ${theme.gradient} text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
                >
                  Ver Planos
                </button>
              </div>
            ) : (
              <>
                <div className={`bg-gradient-to-r ${theme.gradient} rounded-2xl p-6 shadow-xl text-white`}>
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-8 h-8" />
                    <div>
                      <h2 className="text-xl font-bold">Rotina Recomendada</h2>
                      <p className="text-white/80 text-sm">Para {babyAge} {babyAge === 1 ? 'mês' : 'meses'}</p>
                    </div>
                  </div>
                </div>

                {/* Feeding Recommendations */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg border border-${theme.border}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Milk className={`w-6 h-6 text-${theme.primary}-600`} />
                    <h3 className="text-lg font-semibold text-gray-800">Alimentação</h3>
                  </div>
                  <div className="space-y-4">
                    <div className={`bg-${theme.light} rounded-xl p-4 border border-${theme.border}`}>
                      <p className="text-sm text-gray-600 mb-2">Amamentação (peito)</p>
                      <p className={`text-2xl font-bold text-${theme.primary}-600`}>{feedingRoutine.breastFeedings}</p>
                      <p className="text-sm text-gray-600">mamadas por dia</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-2">Fórmula</p>
                      <p className="text-2xl font-bold text-blue-600">{feedingRoutine.formulaAmount}ml</p>
                      <p className="text-sm text-gray-600">por dia (total)</p>
                    </div>
                    <div className={`bg-${theme.light} rounded-xl p-4 border border-${theme.border}`}>
                      <p className="text-sm text-gray-600 mb-2">Intervalo entre mamadas</p>
                      <p className={`text-2xl font-bold text-${theme.primary}-600`}>{feedingRoutine.interval}h</p>
                      <p className="text-sm text-gray-600">aproximadamente</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm text-gray-600 mb-2">Mamadas noturnas</p>
                      <p className="text-2xl font-bold text-indigo-600">{feedingRoutine.nightFeedings}</p>
                      <p className="text-sm text-gray-600">esperadas</p>
                    </div>
                  </div>
                </div>

                {/* Sleep Tips */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Moon className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Dicas de Sono</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                      <Check className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Alimentação antes de dormir</p>
                        <p className="text-sm text-gray-600 mt-1">Uma boa mamada ajuda o bebê a dormir melhor e por mais tempo</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                      <Check className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">Ambiente adequado</p>
                        <p className="text-sm text-gray-600 mt-1">Quarto escuro, silencioso e com temperatura entre 18-21°C</p>
                      </div>
                    </div>
                    <div className={`flex items-start gap-3 p-4 bg-${theme.light} rounded-xl`}>
                      <Check className={`w-5 h-5 text-${theme.primary}-600 mt-1 flex-shrink-0`} />
                      <div>
                        <p className="font-medium text-gray-800">Rotina consistente</p>
                        <p className="text-sm text-gray-600 mt-1">Mantenha horários regulares para criar previsibilidade</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Development Milestones */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Marcos do Desenvolvimento</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {babyAge <= 3 && (
                      <>
                        <p className="text-gray-600">• Segue objetos com os olhos</p>
                        <p className="text-gray-600">• Sorri em resposta a estímulos</p>
                        <p className="text-gray-600">• Emite sons (arrulhos)</p>
                      </>
                    )}
                    {babyAge > 3 && babyAge <= 6 && (
                      <>
                        <p className="text-gray-600">• Rola de barriga para cima</p>
                        <p className="text-gray-600">• Pega objetos</p>
                        <p className="text-gray-600">• Reconhece rostos familiares</p>
                      </>
                    )}
                    {babyAge > 6 && babyAge <= 12 && (
                      <>
                        <p className="text-gray-600">• Senta sem apoio</p>
                        <p className="text-gray-600">• Engatinha ou se arrasta</p>
                        <p className="text-gray-600">• Diz primeiras palavras</p>
                      </>
                    )}
                    {babyAge > 12 && babyAge <= 24 && (
                      <>
                        <p className="text-gray-600">• Anda sozinho</p>
                        <p className="text-gray-600">• Usa 2-3 palavras juntas</p>
                        <p className="text-gray-600">• Imita comportamentos</p>
                      </>
                    )}
                    {babyAge > 24 && (
                      <>
                        <p className="text-gray-600">• Corre e pula</p>
                        <p className="text-gray-600">• Forma frases completas</p>
                        <p className="text-gray-600">• Brinca com outras crianças</p>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal - Feeding Form */}
      {showFeedingForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Mamada</h3>
              <button onClick={() => {
                setShowFeedingForm(false)
                setFeedingFormType('breast')
                setFeedingFormDuration('')
                setFeedingFormAmount('')
                setFeedingFormSide('left')
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Alimentação</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'breast', label: 'Peito', icon: '🤱' },
                    { value: 'formula', label: 'Fórmula', icon: '🍼' },
                    { value: 'both', label: 'Ambos', icon: '🤱🍼' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFeedingFormType(option.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        feedingFormType === option.value
                          ? `border-${theme.primary}-500 bg-${theme.light}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-xs font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {(feedingFormType === 'breast' || feedingFormType === 'both') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Mamada (minutos)</label>
                    <input
                      type="number"
                      value={feedingFormDuration}
                      onChange={(e) => setFeedingFormDuration(e.target.value)}
                      placeholder="Ex: 15"
                      min="0"
                      className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lado do Peito</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'left', label: 'Esquerdo' },
                        { value: 'right', label: 'Direito' },
                        { value: 'both', label: 'Ambos' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setFeedingFormSide(option.value as any)}
                          className={`p-3 rounded-xl border-2 transition-all text-sm ${
                            feedingFormSide === option.value
                              ? `border-${theme.primary}-500 bg-${theme.light} font-medium`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(feedingFormType === 'formula' || feedingFormType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade de Fórmula (ml)</label>
                  <input
                    type="number"
                    value={feedingFormAmount}
                    onChange={(e) => setFeedingFormAmount(e.target.value)}
                    placeholder="Ex: 120"
                    min="0"
                    className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                  />
                </div>
              )}

              <button
                onClick={handleSaveFeedingRecord}
                className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Salvar Mamada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Sleep Form */}
      {showSleepForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Sono</h3>
              <button onClick={() => {
                setShowSleepForm(false)
                setSleepFormType('nap')
                setSleepFormStartTime('')
                setSleepFormEndTime('')
                setSleepFormDuration('')
              }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Sono</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'nap', label: 'Soneca', icon: Sun },
                    { value: 'night', label: 'Sono Noturno', icon: Moon }
                  ].map((option) => {
                    const Icon = option.icon
                    return (
                      <button
                        key={option.value}
                        onClick={() => setSleepFormType(option.value as any)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          sleepFormType === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-sm font-medium">{option.label}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Início</label>
                <input
                  type="time"
                  value={sleepFormStartTime}
                  onChange={(e) => setSleepFormStartTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Término</label>
                <input
                  type="time"
                  value={sleepFormEndTime}
                  onChange={(e) => setSleepFormEndTime(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">ou</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duração Total (minutos)</label>
                <input
                  type="number"
                  value={sleepFormDuration}
                  onChange={(e) => setSleepFormDuration(e.target.value)}
                  placeholder="Ex: 120"
                  min="0"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Preencha a duração OU os horários de início e término</p>
              </div>

              <button
                onClick={handleSaveSleepRecord}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Salvar Sono
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Growth Form */}
      {showGrowthForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nova Medição</h3>
              <button onClick={() => setShowGrowthForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newRecord: GrowthRecord = {
                  id: Date.now().toString(),
                  date: new Date().toLocaleDateString('pt-BR'),
                  weight: parseFloat(formData.get('weight') as string),
                  height: parseFloat(formData.get('height') as string),
                  age: babyAge
                }
                setGrowthRecords([newRecord, ...growthRecords])
                setShowGrowthForm(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                <input
                  type="number"
                  name="weight"
                  step="0.1"
                  required
                  placeholder="Ex: 5.2"
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Altura (cm)</label>
                <input
                  type="number"
                  name="height"
                  step="0.1"
                  required
                  placeholder="Ex: 58.5"
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>
              <button
                type="submit"
                className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Salvar Medição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Observation Form */}
      {showObservationForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Nova Observação</h3>
              <button onClick={() => setShowObservationForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newObs: BabyObservation = {
                  id: Date.now().toString(),
                  date: new Date().toLocaleDateString('pt-BR'),
                  smiles: formData.get('smiles') === 'on',
                  cries: formData.get('cries') === 'on',
                  colic: formData.get('colic') === 'on',
                  sleepsWell: formData.get('sleepsWell') === 'on',
                  eatsWell: formData.get('eatsWell') === 'on',
                  active: formData.get('active') === 'on',
                  calm: formData.get('calm') === 'on',
                  fussy: formData.get('fussy') === 'on',
                  notes: formData.get('notes') as string
                }
                setObservations([newObs, ...observations])
                setShowObservationForm(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Como está o bebê hoje?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'smiles', label: 'Sorri bastante', icon: '😊' },
                    { name: 'cries', label: 'Chora muito', icon: '😢' },
                    { name: 'colic', label: 'Tem cólica', icon: '😣' },
                    { name: 'sleepsWell', label: 'Dorme bem', icon: '😴' },
                    { name: 'eatsWell', label: 'Come bem', icon: '🍼' },
                    { name: 'active', label: 'Muito ativo', icon: '⚡' },
                    { name: 'calm', label: 'Calmo', icon: '😌' },
                    { name: 'fussy', label: 'Irritado', icon: '😤' }
                  ].map((option) => (
                    <label key={option.name} className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 cursor-pointer transition-all">
                      <input type="checkbox" name={option.name} className="w-4 h-4 rounded" />
                      <span className="text-xl">{option.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações adicionais</label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Descreva outros comportamentos ou situações..."
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none resize-none`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Salvar Observação
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Medicine Form */}
      {showMedicineForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Adicionar Remédio</h3>
              <button onClick={() => setShowMedicineForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newMedicine: Medicine = {
                  id: Date.now().toString(),
                  name: formData.get('name') as string,
                  dosage: formData.get('dosage') as string,
                  frequency: formData.get('frequency') as string,
                  startDate: formData.get('startDate') as string,
                  endDate: formData.get('endDate') as string || undefined,
                  purpose: formData.get('purpose') as string,
                  notes: formData.get('notes') as string || undefined
                }
                setMedicines([newMedicine, ...medicines])
                setShowMedicineForm(false)
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Remédio</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ex: Luftal"
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade</label>
                <input
                  type="text"
                  name="purpose"
                  required
                  placeholder="Ex: Alívio de gases"
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosagem</label>
                  <input
                    type="text"
                    name="dosage"
                    required
                    placeholder="Ex: 5 gotas"
                    className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                  <input
                    type="text"
                    name="frequency"
                    required
                    placeholder="Ex: 3x ao dia"
                    className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data de Término</label>
                  <input
                    type="date"
                    name="endDate"
                    className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Informações adicionais..."
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none resize-none`}
                />
              </div>

              <button
                type="submit"
                className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Salvar Remédio
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Profile Edit */}
      {showProfileForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Editar Perfil</h3>
              <button onClick={() => setShowProfileForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={babyProfile.name}
                  onChange={(e) => setBabyProfile({ ...babyProfile, name: e.target.value })}
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={babyProfile.birthDate}
                  onChange={(e) => setBabyProfile({ ...babyProfile, birthDate: e.target.value })}
                  className={`w-full p-3 border-2 border-gray-200 rounded-xl focus:border-${theme.primary}-500 focus:outline-none`}
                />
              </div>
              <button
                onClick={() => setShowProfileForm(false)}
                className={`w-full py-4 bg-gradient-to-r ${theme.gradient} text-white rounded-xl font-semibold hover:shadow-lg transition-all`}
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Subscription */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${theme.gradient} rounded-full mb-4`}>
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Tilly Premium</h2>
              <p className="text-gray-600">Continue acompanhando o desenvolvimento do seu bebê</p>
            </div>

            <div className="space-y-4 mb-8">
              <button
                onClick={() => handleSubscribe('monthly')}
                className={`w-full p-6 border-2 border-${theme.border} rounded-2xl hover:border-${theme.primary}-400 transition-all text-left`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">Mensal</h3>
                  <span className={`text-2xl font-bold text-${theme.primary}-600`}>R$ 14,99</span>
                </div>
                <p className="text-sm text-gray-600">por mês</p>
              </button>

              <button
                onClick={() => handleSubscribe('yearly')}
                className={`w-full p-6 border-2 border-${theme.primary}-400 bg-${theme.light} rounded-2xl hover:border-${theme.primary}-500 transition-all text-left relative`}
              >
                <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Economize 17%
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-800">Anual</h3>
                  <div className="text-right">
                    <span className={`text-2xl font-bold text-${theme.primary}-600`}>R$ 149,90</span>
                    <p className="text-xs text-gray-500">R$ 12,49/mês</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">por ano</p>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Acompanhamento completo até 3 anos</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Sugestões personalizadas baseadas em IA</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Recomendações de remédios e cuidados</p>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-sm text-gray-700">Histórico ilimitado de registros</p>
              </div>
            </div>

            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
