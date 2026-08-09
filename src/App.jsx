import { useEffect, useState } from 'react'
import './App.css'

/* =====================================================
   مدة حفظ البيانات المؤقتة
===================================================== */

const STORAGE_EXPIRY_HOURS = 6

const STORAGE_EXPIRY_MS =
  STORAGE_EXPIRY_HOURS * 60 * 60 * 1000

const LAST_ACTIVITY_KEY = 'afaaq-last-activity'

const REPORT_STORAGE_KEYS = [
  'afaaq-activity-form',
  'afaaq-activity-activities',
  'afaaq-weekly-form',
  'afaaq-weekly-activities',
  'afaaq-monthly-form',
]

const clearReportStorage = () => {
  REPORT_STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key)
  })

  localStorage.removeItem('afaaq-current-view')
  localStorage.removeItem(LAST_ACTIVITY_KEY)
}

const prepareTemporaryStorage = () => {
  const lastActivity = Number(
    localStorage.getItem(LAST_ACTIVITY_KEY)
  )

  const hasSavedReportData =
    REPORT_STORAGE_KEYS.some(
      (key) => localStorage.getItem(key) !== null
    )

  if (!lastActivity) {
    if (hasSavedReportData) {
      localStorage.setItem(
        LAST_ACTIVITY_KEY,
        String(Date.now())
      )
    }

    return
  }

  const isExpired =
    Date.now() - lastActivity >= STORAGE_EXPIRY_MS

  if (isExpired) {
    clearReportStorage()
  }
}

const touchStorageActivity = () => {
  localStorage.setItem(
    LAST_ACTIVITY_KEY,
    String(Date.now())
  )
}

prepareTemporaryStorage()

/* =====================================================
   البيانات الثابتة
===================================================== */

const countries = [
  'موزمبيق',
  'أنغولا',
  'ساوتومي وبرينسيب',
  'الرأس الأخضر',
  'غينيا بيساو',
]

const programs = [
  'التعريف بالإسلام',
  'تثبيت المسلم الجديد',
  'تعليم المسلمين',
]

const beneficiaryTypes = [
  'المسلمون',
  'غير المسلمين',
  'الجميع',
]

/* =====================================================
   القيم الافتراضية
===================================================== */

/*
  البيانات العامة المشتركة
  لجميع أنشطة اليوم
*/

const emptyActivityForm = {
  preacherName: '',
  country: '',
  activityDate: '',
  notes: '',
}

/*
  بيانات النشاط الواحد
  داخل تقرير النشاط الدعوي
*/

const emptyDailyActivity = {
  program: '',
  activityTitle: '',
  activityPlace: '',
  beneficiaryType: '',
  beneficiaryCount: '0',
  newMuslimsCount: '0',
  description: '',
  results: '',
}

const emptyWeeklyActivity = {
  program: '',
  activityTitle: '',
  beneficiaryType: '',
  beneficiaryCount: '0',
  newMuslimsCount: '0',
}

const emptyWeeklyForm = {
  preacherName: '',
  country: '',
  dateFrom: '',
  dateTo: '',
  results: '',
  challenges: '',
  notes: '',
}

const emptyMonthlyForm = {
  preacherName: '',
  country: '',
  month: '',

  islamActivities: '0',
  islamBeneficiaries: '0',
  islamNewMuslims: '0',

  newMuslimActivities: '0',
  newMuslimBeneficiaries: '0',

  teachingActivities: '0',
  teachingBeneficiaries: '0',

  highlights: '',
  results: '',
  challenges: '',
  notes: '',
}

function App() {
  /* =====================================================
     الصفحة الحالية
  ===================================================== */

  const [view, setView] = useState(() => {
    return (
      localStorage.getItem('afaaq-current-view') ||
      'home'
    )
  })

  /* =====================================================
     تقرير النشاط الدعوي
  ===================================================== */

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(
      'afaaq-activity-form'
    )

    if (saved) {
      try {
        const parsed = JSON.parse(saved)

        return {
          preacherName:
            parsed.preacherName || '',
          country:
            parsed.country || '',
          activityDate:
            parsed.activityDate || '',
          notes:
            parsed.notes || '',
        }
      } catch {
        return emptyActivityForm
      }
    }

    return emptyActivityForm
  })

  const [activityActivities, setActivityActivities] =
    useState(() => {
      const savedActivities =
        localStorage.getItem(
          'afaaq-activity-activities'
        )

      if (savedActivities) {
        try {
          const parsed =
            JSON.parse(savedActivities)

          return parsed.length
            ? parsed
            : [{ ...emptyDailyActivity }]
        } catch {
          return [{ ...emptyDailyActivity }]
        }
      }

      /*
        تحويل بيانات النشاط الواحد
        من النسخة السابقة تلقائيًا
        إلى النشاط رقم 1
      */

      const oldSavedForm =
        localStorage.getItem(
          'afaaq-activity-form'
        )

      if (oldSavedForm) {
        try {
          const oldData =
            JSON.parse(oldSavedForm)

          const hasOldActivityData =
            oldData.program ||
            oldData.activityTitle ||
            oldData.activityPlace ||
            oldData.beneficiaryType ||
            Number(oldData.beneficiaryCount) > 0 ||
            Number(oldData.newMuslimsCount) > 0 ||
            oldData.description ||
            oldData.results

          if (hasOldActivityData) {
            return [
              {
                program:
                  oldData.program || '',
                activityTitle:
                  oldData.activityTitle || '',
                activityPlace:
                  oldData.activityPlace || '',
                beneficiaryType:
                  oldData.beneficiaryType || '',
                beneficiaryCount:
                  oldData.beneficiaryCount || '0',
                newMuslimsCount:
                  oldData.newMuslimsCount || '0',
                description:
                  oldData.description || '',
                results:
                  oldData.results || '',
              },
            ]
          }
        } catch {
          // نبدأ بنشاط فارغ
        }
      }

      return [{ ...emptyDailyActivity }]
    })

  /* =====================================================
     التقرير الأسبوعي
  ===================================================== */

  const [weeklyForm, setWeeklyForm] = useState(() => {
    const saved = localStorage.getItem(
      'afaaq-weekly-form'
    )

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return emptyWeeklyForm
      }
    }

    return emptyWeeklyForm
  })

  const [weeklyActivities, setWeeklyActivities] =
    useState(() => {
      const saved = localStorage.getItem(
        'afaaq-weekly-activities'
      )

      if (saved) {
        try {
          const parsed = JSON.parse(saved)

          return parsed.length
            ? parsed
            : [{ ...emptyWeeklyActivity }]
        } catch {
          return [{ ...emptyWeeklyActivity }]
        }
      }

      return [{ ...emptyWeeklyActivity }]
    })

  /* =====================================================
     التقرير الشهري
  ===================================================== */

  const [monthlyForm, setMonthlyForm] = useState(() => {
    const saved = localStorage.getItem(
      'afaaq-monthly-form'
    )

    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return emptyMonthlyForm
      }
    }

    return emptyMonthlyForm
  })

  /* =====================================================
     الصور
     لا يتم حفظ الصور في localStorage
  ===================================================== */

  const [images, setImages] = useState([])
  const [weeklyImages, setWeeklyImages] =
    useState([])
  const [monthlyImages, setMonthlyImages] =
    useState([])

  /* =====================================================
     حفظ الصفحة الحالية
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      'afaaq-current-view',
      view
    )
  }, [view])

  /* =====================================================
     حفظ تقرير النشاط
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      'afaaq-activity-form',
      JSON.stringify(formData)
    )
  }, [formData])

  useEffect(() => {
    localStorage.setItem(
      'afaaq-activity-activities',
      JSON.stringify(activityActivities)
    )
  }, [activityActivities])

  /* =====================================================
     حفظ التقرير الأسبوعي
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      'afaaq-weekly-form',
      JSON.stringify(weeklyForm)
    )
  }, [weeklyForm])

  useEffect(() => {
    localStorage.setItem(
      'afaaq-weekly-activities',
      JSON.stringify(weeklyActivities)
    )
  }, [weeklyActivities])

  /* =====================================================
     حفظ التقرير الشهري
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      'afaaq-monthly-form',
      JSON.stringify(monthlyForm)
    )
  }, [monthlyForm])

  /* =====================================================
     التنقل
  ===================================================== */

  const changeView = (nextView) => {
    setView(nextView)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  /* =====================================================
     تقرير النشاط الدعوي
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target

    touchStorageActivity()

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleActivityChange = (
    index,
    field,
    value
  ) => {
    touchStorageActivity()

    setActivityActivities((previous) =>
      previous.map(
        (activity, activityIndex) =>
          activityIndex === index
            ? {
                ...activity,
                [field]: value,
              }
            : activity
      )
    )
  }

  const addActivity = () => {
    touchStorageActivity()

    setActivityActivities((previous) => [
      ...previous,
      { ...emptyDailyActivity },
    ])
  }

  const removeActivity = (index) => {
    if (activityActivities.length === 1) {
      return
    }

    touchStorageActivity()

    setActivityActivities((previous) =>
      previous.filter(
        (_, activityIndex) =>
          activityIndex !== index
      )
    )
  }

  const handleImages = (event) => {
    const files = Array.from(
      event.target.files || []
    )

    touchStorageActivity()

    const selectedImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setImages(selectedImages)
  }

  const activityTotals =
    activityActivities.reduce(
      (totals, activity) => {
        totals.activities += 1

        totals.beneficiaries +=
          Number(activity.beneficiaryCount) || 0

        totals.newMuslims +=
          Number(activity.newMuslimsCount) || 0

        return totals
      },
      {
        activities: 0,
        beneficiaries: 0,
        newMuslims: 0,
      }
    )

  const handlePreview = () => {
    changeView('activity-preview')
  }

  /* =====================================================
     التقرير الأسبوعي
  ===================================================== */

  const handleWeeklyChange = (event) => {
    const { name, value } = event.target

    touchStorageActivity()

    setWeeklyForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleWeeklyActivityChange = (
    index,
    field,
    value
  ) => {
    touchStorageActivity()

    setWeeklyActivities((previous) =>
      previous.map(
        (activity, activityIndex) =>
          activityIndex === index
            ? {
                ...activity,
                [field]: value,
              }
            : activity
      )
    )
  }

  const addWeeklyActivity = () => {
    touchStorageActivity()

    setWeeklyActivities((previous) => [
      ...previous,
      { ...emptyWeeklyActivity },
    ])
  }

  const removeWeeklyActivity = (index) => {
    if (weeklyActivities.length === 1) {
      return
    }

    touchStorageActivity()

    setWeeklyActivities((previous) =>
      previous.filter(
        (_, activityIndex) =>
          activityIndex !== index
      )
    )
  }

  const handleWeeklyImages = (event) => {
    const files = Array.from(
      event.target.files || []
    )

    touchStorageActivity()

    const selectedImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setWeeklyImages(selectedImages)
  }

  const weeklyTotals = weeklyActivities.reduce(
    (totals, activity) => {
      totals.activities += 1

      totals.beneficiaries +=
        Number(activity.beneficiaryCount) || 0

      totals.newMuslims +=
        Number(activity.newMuslimsCount) || 0

      return totals
    },
    {
      activities: 0,
      beneficiaries: 0,
      newMuslims: 0,
    }
  )

  const handleWeeklyPreview = () => {
    changeView('weekly-preview')
  }

  /* =====================================================
     التقرير الشهري
  ===================================================== */

  const handleMonthlyChange = (event) => {
    const { name, value } = event.target

    touchStorageActivity()

    setMonthlyForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleMonthlyImages = (event) => {
    const files = Array.from(
      event.target.files || []
    )

    touchStorageActivity()

    const selectedImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }))

    setMonthlyImages(selectedImages)
  }

  const monthlyTotals = {
    activities:
      (Number(
        monthlyForm.islamActivities
      ) || 0) +
      (Number(
        monthlyForm.newMuslimActivities
      ) || 0) +
      (Number(
        monthlyForm.teachingActivities
      ) || 0),

    beneficiaries:
      (Number(
        monthlyForm.islamBeneficiaries
      ) || 0) +
      (Number(
        monthlyForm.newMuslimBeneficiaries
      ) || 0) +
      (Number(
        monthlyForm.teachingBeneficiaries
      ) || 0),

    newMuslims:
      Number(
        monthlyForm.islamNewMuslims
      ) || 0,
  }

  const handleMonthlyPreview = () => {
    changeView('monthly-preview')
  }

  /* =====================================================
     الطباعة
  ===================================================== */

  const handlePrint = () => {
    window.print()
  }

  /* =====================================================
     معاينة التقرير الشهري
  ===================================================== */

  if (view === 'monthly-preview') {
    return (
      <main
        className="app-shell preview-shell"
        dir="rtl"
      >
        <section className="home-card report-page printable-report">
          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>التقرير الشهري</h1>

            <p className="no-print">
              معاينة التقرير قبل التصدير
            </p>
          </div>

          <div className="preview-content">
            <div className="preview-grid">
              <div className="preview-item">
                <strong>اسم الداعية</strong>
                <span>
                  {monthlyForm.preacherName || '—'}
                </span>
              </div>

              <div className="preview-item">
                <strong>الدولة</strong>
                <span>
                  {monthlyForm.country || '—'}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>الشهر والسنة</strong>
                <span>
                  {monthlyForm.month || '—'}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                ملخص البرامج والأنشطة
              </h2>
            </div>

            <div className="preview-grid">
              <div className="preview-item preview-wide">
                <strong>
                  التعريف بالإسلام
                </strong>

                <span
                  style={{
                    whiteSpace: 'pre-line',
                  }}
                >
                  {`عدد الأنشطة: ${monthlyForm.islamActivities || '0'}
عدد المستفيدين: ${monthlyForm.islamBeneficiaries || '0'}
عدد الداخلين في الإسلام: ${monthlyForm.islamNewMuslims || '0'}`}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  تثبيت المسلم الجديد
                </strong>

                <span
                  style={{
                    whiteSpace: 'pre-line',
                  }}
                >
                  {`عدد الأنشطة: ${monthlyForm.newMuslimActivities || '0'}
عدد المستفيدين: ${monthlyForm.newMuslimBeneficiaries || '0'}`}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  تعليم المسلمين
                </strong>

                <span
                  style={{
                    whiteSpace: 'pre-line',
                  }}
                >
                  {`عدد الأنشطة: ${monthlyForm.teachingActivities || '0'}
عدد المستفيدين: ${monthlyForm.teachingBeneficiaries || '0'}`}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                إجمالي الشهر
              </h2>
            </div>

            <div className="preview-grid">
              <div className="preview-item">
                <strong>
                  إجمالي الأنشطة
                </strong>

                <span>
                  {monthlyTotals.activities}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  إجمالي المستفيدين
                </strong>

                <span>
                  {monthlyTotals.beneficiaries}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  إجمالي الداخلين في الإسلام
                </strong>

                <span>
                  {monthlyTotals.newMuslims}
                </span>
              </div>
            </div>

            <div className="preview-grid">
              <div className="preview-item preview-wide">
                <strong>
                  أبرز الأنشطة خلال الشهر
                </strong>

                <span>
                  {monthlyForm.highlights || '—'}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  أبرز النتائج والإنجازات
                </strong>

                <span>
                  {monthlyForm.results || '—'}
                </span>
              </div>

              {monthlyForm.challenges && (
                <div className="preview-item preview-wide">
                  <strong>
                    التحديات أو الصعوبات
                  </strong>

                  <span>
                    {monthlyForm.challenges}
                  </span>
                </div>
              )}

              {monthlyForm.notes && (
                <div className="preview-item preview-wide">
                  <strong>
                    ملاحظات
                  </strong>

                  <span>
                    {monthlyForm.notes}
                  </span>
                </div>
              )}
            </div>

            {monthlyImages.length > 0 && (
              <div className="preview-images-section">
                <h2>
                  الصور والشواهد
                </h2>

                <div className="preview-images">
                  {monthlyImages.map(
                    (image, index) => (
                      <img
                        key={`${image.name}-${index}`}
                        src={image.url}
                        alt={`شاهد ${index + 1}`}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className="form-actions preview-actions no-print">
              <button
                type="button"
                className="back-button"
                onClick={() =>
                  changeView('monthly')
                }
              >
                تعديل التقرير
              </button>

              <button
                type="button"
                className="preview-button"
                onClick={handlePrint}
              >
                تصدير PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* =====================================================
     معاينة التقرير الأسبوعي
  ===================================================== */

  if (view === 'weekly-preview') {
    return (
      <main
        className="app-shell preview-shell"
        dir="rtl"
      >
        <section className="home-card report-page printable-report">
          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>
              التقرير الأسبوعي
            </h1>

            <p className="no-print">
              معاينة التقرير قبل التصدير
            </p>
          </div>

          <div className="preview-content">
            <div className="preview-grid">
              <div className="preview-item">
                <strong>
                  اسم الداعية
                </strong>

                <span>
                  {weeklyForm.preacherName || '—'}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  الدولة
                </strong>

                <span>
                  {weeklyForm.country || '—'}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  الفترة من
                </strong>

                <span>
                  {weeklyForm.dateFrom || '—'}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  إلى
                </strong>

                <span>
                  {weeklyForm.dateTo || '—'}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                ملخص الأسبوع
              </h2>
            </div>

            <div className="preview-grid">
              <div className="preview-item">
                <strong>
                  إجمالي الأنشطة
                </strong>

                <span>
                  {weeklyTotals.activities}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  إجمالي المستفيدين
                </strong>

                <span>
                  {weeklyTotals.beneficiaries}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  إجمالي الداخلين في الإسلام
                </strong>

                <span>
                  {weeklyTotals.newMuslims}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                الأنشطة المنفذة خلال الأسبوع
              </h2>
            </div>

            <div className="preview-grid">
              {weeklyActivities.map(
                (activity, index) => (
                  <div
                    className="preview-item preview-wide"
                    key={index}
                  >
                    <strong>
                      النشاط رقم {index + 1}
                    </strong>

                    <span
                      style={{
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {`البرنامج: ${activity.program || '—'}
عنوان النشاط: ${activity.activityTitle || '—'}
المستفيدون: ${activity.beneficiaryType || '—'}
عدد المستفيدين: ${activity.beneficiaryCount || '0'}
عدد الداخلين في الإسلام: ${activity.newMuslimsCount || '0'}`}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="preview-grid">
              <div className="preview-item preview-wide">
                <strong>
                  أبرز النتائج والإنجازات خلال الأسبوع
                </strong>

                <span>
                  {weeklyForm.results || '—'}
                </span>
              </div>

              {weeklyForm.challenges && (
                <div className="preview-item preview-wide">
                  <strong>
                    التحديات أو الصعوبات
                  </strong>

                  <span>
                    {weeklyForm.challenges}
                  </span>
                </div>
              )}

              {weeklyForm.notes && (
                <div className="preview-item preview-wide">
                  <strong>
                    ملاحظات
                  </strong>

                  <span>
                    {weeklyForm.notes}
                  </span>
                </div>
              )}
            </div>

            {weeklyImages.length > 0 && (
              <div className="preview-images-section">
                <h2>
                  الصور والشواهد
                </h2>

                <div className="preview-images">
                  {weeklyImages.map(
                    (image, index) => (
                      <img
                        key={`${image.name}-${index}`}
                        src={image.url}
                        alt={`شاهد ${index + 1}`}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className="form-actions preview-actions no-print">
              <button
                type="button"
                className="back-button"
                onClick={() =>
                  changeView('weekly')
                }
              >
                تعديل التقرير
              </button>

              <button
                type="button"
                className="preview-button"
                onClick={handlePrint}
              >
                تصدير PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* =====================================================
     معاينة تقرير النشاط الدعوي
  ===================================================== */

  if (view === 'activity-preview') {
    return (
      <main
        className="app-shell preview-shell"
        dir="rtl"
      >
        <section className="home-card report-page printable-report">
          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>
              تقرير نشاط دعوي
            </h1>

            <p className="no-print">
              معاينة التقرير قبل التصدير
            </p>
          </div>

          <div className="preview-content">
            <div className="preview-grid">
              <div className="preview-item">
                <strong>
                  اسم الداعية
                </strong>

                <span>
                  {formData.preacherName || '—'}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  الدولة
                </strong>

                <span>
                  {formData.country || '—'}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  تاريخ النشاط
                </strong>

                <span>
                  {formData.activityDate || '—'}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                ملخص اليوم
              </h2>
            </div>

            <div className="preview-grid">
              <div className="preview-item">
                <strong>
                  إجمالي الأنشطة
                </strong>

                <span>
                  {activityTotals.activities}
                </span>
              </div>

              <div className="preview-item">
                <strong>
                  إجمالي المستفيدين
                </strong>

                <span>
                  {activityTotals.beneficiaries}
                </span>
              </div>

              <div className="preview-item preview-wide">
                <strong>
                  إجمالي الداخلين في الإسلام
                </strong>

                <span>
                  {activityTotals.newMuslims}
                </span>
              </div>
            </div>

            <div className="weekly-preview-section-title">
              <h2>
                الأنشطة المنفذة خلال اليوم
              </h2>
            </div>

            <div className="preview-grid">
              {activityActivities.map(
                (activity, index) => (
                  <div
                    className="preview-item preview-wide"
                    key={index}
                  >
                    <strong>
                      النشاط رقم {index + 1}
                    </strong>

                    <span
                      style={{
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {`البرنامج: ${activity.program || '—'}
عنوان النشاط: ${activity.activityTitle || '—'}
مكان تنفيذ النشاط: ${activity.activityPlace || '—'}
المستفيدون: ${activity.beneficiaryType || '—'}
عدد المستفيدين: ${activity.beneficiaryCount || '0'}
عدد الداخلين في الإسلام: ${activity.newMuslimsCount || '0'}
وصف مختصر للنشاط: ${activity.description || '—'}
أبرز النتائج: ${activity.results || '—'}`}
                    </span>
                  </div>
                )
              )}
            </div>

            {formData.notes && (
              <div className="preview-grid">
                <div className="preview-item preview-wide">
                  <strong>
                    ملاحظات عامة
                  </strong>

                  <span>
                    {formData.notes}
                  </span>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="preview-images-section">
                <h2>
                  الصور والشواهد
                </h2>

                <div className="preview-images">
                  {images.map(
                    (image, index) => (
                      <img
                        key={`${image.name}-${index}`}
                        src={image.url}
                        alt={`شاهد ${index + 1}`}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className="form-actions preview-actions no-print">
              <button
                type="button"
                className="back-button"
                onClick={() =>
                  changeView('activity')
                }
              >
                تعديل التقرير
              </button>

              <button
                type="button"
                className="preview-button"
                onClick={handlePrint}
              >
                تصدير PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  /* =====================================================
     نموذج تقرير النشاط الدعوي
  ===================================================== */

  if (view === 'activity') {
    return (
      <main
        className="app-shell"
        dir="rtl"
      >
        <section className="home-card report-page">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              changeView('home')
            }
          >
            ← رجوع
          </button>

          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>
              تقرير نشاط دعوي
            </h1>

            <p>
              أدخل أنشطة اليوم لإعداد التقرير
            </p>
          </div>

          <form
            className="report-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            {/* البيانات الأساسية */}

            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="preacherName">
                  اسم الداعية
                </label>

                <input
                  id="preacherName"
                  name="preacherName"
                  type="text"
                  value={formData.preacherName}
                  onChange={handleChange}
                  placeholder="اكتب اسم الداعية"
                />
              </div>

              <div className="form-field">
                <label htmlFor="country">
                  الدولة
                </label>

                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="">
                    اختر الدولة
                  </option>

                  {countries.map(
                    (country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="activityDate">
                  تاريخ النشاط
                </label>

                <input
                  id="activityDate"
                  name="activityDate"
                  type="date"
                  value={formData.activityDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* الأنشطة */}

            <div className="weekly-section">
              <h2 className="weekly-section-title">
                الأنشطة المنفذة خلال اليوم
              </h2>

              {activityActivities.map(
                (activity, index) => (
                  <div
                    className="weekly-activity-card"
                    key={index}
                  >
                    <div className="weekly-activity-header">
                      <strong>
                        النشاط رقم {index + 1}
                      </strong>

                      {activityActivities.length >
                        1 && (
                        <button
                          type="button"
                          className="remove-activity-button"
                          onClick={() =>
                            removeActivity(index)
                          }
                        >
                          حذف النشاط
                        </button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-field form-field-wide">
                        <label>
                          البرنامج
                        </label>

                        <select
                          value={activity.program}
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'program',
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            اختر البرنامج
                          </option>

                          {programs.map(
                            (program) => (
                              <option
                                key={program}
                                value={program}
                              >
                                {program}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          عنوان النشاط
                        </label>

                        <input
                          type="text"
                          value={
                            activity.activityTitle
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'activityTitle',
                              event.target.value
                            )
                          }
                          placeholder="مثال: تعليم الأطفال صفة الصلاة"
                        />
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          مكان تنفيذ النشاط
                        </label>

                        <input
                          type="text"
                          value={
                            activity.activityPlace
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'activityPlace',
                              event.target.value
                            )
                          }
                          placeholder="اكتب مكان تنفيذ النشاط"
                        />
                      </div>

                      <div className="form-field">
                        <label>
                          المستفيدون
                        </label>

                        <select
                          value={
                            activity.beneficiaryType
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'beneficiaryType',
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            اختر فئة المستفيدين
                          </option>

                          {beneficiaryTypes.map(
                            (type) => (
                              <option
                                key={type}
                                value={type}
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="form-field">
                        <label>
                          عدد المستفيدين
                        </label>

                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={
                            activity.beneficiaryCount
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'beneficiaryCount',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          عدد الداخلين في الإسلام
                        </label>

                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={
                            activity.newMuslimsCount
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'newMuslimsCount',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          وصف مختصر للنشاط
                        </label>

                        <textarea
                          rows="4"
                          value={
                            activity.description
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'description',
                              event.target.value
                            )
                          }
                          placeholder="اكتب وصفًا مختصرًا لما تم في النشاط"
                        />
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          أبرز النتائج
                        </label>

                        <textarea
                          rows="4"
                          value={
                            activity.results
                          }
                          onChange={(event) =>
                            handleActivityChange(
                              index,
                              'results',
                              event.target.value
                            )
                          }
                          placeholder="اكتب أبرز النتائج التي تحققت"
                        />
                      </div>
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                className="add-activity-button"
                onClick={addActivity}
              >
                + إضافة نشاط آخر
              </button>
            </div>

            {/* الإجماليات */}

            <div className="weekly-totals">
              <div className="weekly-total-card">
                <strong>
                  {activityTotals.activities}
                </strong>

                <span>
                  إجمالي الأنشطة
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {activityTotals.beneficiaries}
                </strong>

                <span>
                  إجمالي المستفيدين
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {activityTotals.newMuslims}
                </strong>

                <span>
                  إجمالي الداخلين في الإسلام
                </span>
              </div>
            </div>

            {/* الملاحظات والصور */}

            <div className="form-grid">
              <div className="form-field form-field-wide">
                <label htmlFor="notes">
                  ملاحظات عامة

                  <span className="optional-text">
                    {' '}— اختياري
                  </span>
                </label>

                <textarea
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="أي ملاحظات إضافية على أنشطة اليوم"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="evidence">
                  الصور والشواهد
                </label>

                <input
                  id="evidence"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                />

                <small className="field-hint">
                  يمكنك اختيار عدة صور مشتركة لأنشطة اليوم
                </small>

                {images.length > 0 && (
                  <small className="field-hint">
                    تم اختيار {images.length} صورة
                  </small>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="preview-button"
                onClick={handlePreview}
              >
                معاينة التقرير
              </button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  /* =====================================================
     نموذج التقرير الأسبوعي
  ===================================================== */

  if (view === 'weekly') {
    return (
      <main
        className="app-shell"
        dir="rtl"
      >
        <section className="home-card report-page">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              changeView('home')
            }
          >
            ← رجوع
          </button>

          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>
              التقرير الأسبوعي
            </h1>

            <p>
              أدخل أنشطة الأسبوع لإعداد التقرير
            </p>
          </div>

          <form
            className="report-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="weeklyPreacherName">
                  اسم الداعية
                </label>

                <input
                  id="weeklyPreacherName"
                  name="preacherName"
                  type="text"
                  value={weeklyForm.preacherName}
                  onChange={handleWeeklyChange}
                  placeholder="اكتب اسم الداعية"
                />
              </div>

              <div className="form-field">
                <label htmlFor="weeklyCountry">
                  الدولة
                </label>

                <select
                  id="weeklyCountry"
                  name="country"
                  value={weeklyForm.country}
                  onChange={handleWeeklyChange}
                >
                  <option value="">
                    اختر الدولة
                  </option>

                  {countries.map(
                    (country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="dateFrom">
                  الفترة من
                </label>

                <input
                  id="dateFrom"
                  name="dateFrom"
                  type="date"
                  value={weeklyForm.dateFrom}
                  onChange={handleWeeklyChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="dateTo">
                  إلى
                </label>

                <input
                  id="dateTo"
                  name="dateTo"
                  type="date"
                  value={weeklyForm.dateTo}
                  onChange={handleWeeklyChange}
                />
              </div>
            </div>

            <div className="weekly-section">
              <h2 className="weekly-section-title">
                الأنشطة المنفذة خلال الأسبوع
              </h2>

              {weeklyActivities.map(
                (activity, index) => (
                  <div
                    className="weekly-activity-card"
                    key={index}
                  >
                    <div className="weekly-activity-header">
                      <strong>
                        النشاط رقم {index + 1}
                      </strong>

                      {weeklyActivities.length > 1 && (
                        <button
                          type="button"
                          className="remove-activity-button"
                          onClick={() =>
                            removeWeeklyActivity(index)
                          }
                        >
                          حذف النشاط
                        </button>
                      )}
                    </div>

                    <div className="form-grid">
                      <div className="form-field form-field-wide">
                        <label>
                          البرنامج
                        </label>

                        <select
                          value={activity.program}
                          onChange={(event) =>
                            handleWeeklyActivityChange(
                              index,
                              'program',
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            اختر البرنامج
                          </option>

                          {programs.map(
                            (program) => (
                              <option
                                key={program}
                                value={program}
                              >
                                {program}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          عنوان النشاط
                        </label>

                        <input
                          type="text"
                          value={
                            activity.activityTitle
                          }
                          onChange={(event) =>
                            handleWeeklyActivityChange(
                              index,
                              'activityTitle',
                              event.target.value
                            )
                          }
                          placeholder="اكتب عنوان النشاط"
                        />
                      </div>

                      <div className="form-field">
                        <label>
                          المستفيدون
                        </label>

                        <select
                          value={
                            activity.beneficiaryType
                          }
                          onChange={(event) =>
                            handleWeeklyActivityChange(
                              index,
                              'beneficiaryType',
                              event.target.value
                            )
                          }
                        >
                          <option value="">
                            اختر فئة المستفيدين
                          </option>

                          {beneficiaryTypes.map(
                            (type) => (
                              <option
                                key={type}
                                value={type}
                              >
                                {type}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div className="form-field">
                        <label>
                          عدد المستفيدين
                        </label>

                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={
                            activity.beneficiaryCount
                          }
                          onChange={(event) =>
                            handleWeeklyActivityChange(
                              index,
                              'beneficiaryCount',
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="form-field form-field-wide">
                        <label>
                          عدد الداخلين في الإسلام
                        </label>

                        <input
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={
                            activity.newMuslimsCount
                          }
                          onChange={(event) =>
                            handleWeeklyActivityChange(
                              index,
                              'newMuslimsCount',
                              event.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                className="add-activity-button"
                onClick={addWeeklyActivity}
              >
                + إضافة نشاط آخر
              </button>
            </div>

            <div className="weekly-totals">
              <div className="weekly-total-card">
                <strong>
                  {weeklyTotals.activities}
                </strong>

                <span>
                  إجمالي الأنشطة
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {weeklyTotals.beneficiaries}
                </strong>

                <span>
                  إجمالي المستفيدين
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {weeklyTotals.newMuslims}
                </strong>

                <span>
                  إجمالي الداخلين في الإسلام
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field form-field-wide">
                <label htmlFor="weeklyResults">
                  أبرز النتائج والإنجازات خلال الأسبوع
                </label>

                <textarea
                  id="weeklyResults"
                  name="results"
                  rows="4"
                  value={weeklyForm.results}
                  onChange={handleWeeklyChange}
                  placeholder="اكتب أبرز النتائج والإنجازات"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="weeklyChallenges">
                  التحديات أو الصعوبات

                  <span className="optional-text">
                    {' '}— اختياري
                  </span>
                </label>

                <textarea
                  id="weeklyChallenges"
                  name="challenges"
                  rows="3"
                  value={weeklyForm.challenges}
                  onChange={handleWeeklyChange}
                  placeholder="اكتب التحديات أو الصعوبات إن وجدت"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="weeklyNotes">
                  ملاحظات

                  <span className="optional-text">
                    {' '}— اختياري
                  </span>
                </label>

                <textarea
                  id="weeklyNotes"
                  name="notes"
                  rows="3"
                  value={weeklyForm.notes}
                  onChange={handleWeeklyChange}
                  placeholder="أي ملاحظات إضافية"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="weeklyEvidence">
                  الصور والشواهد
                </label>

                <input
                  id="weeklyEvidence"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleWeeklyImages}
                />

                <small className="field-hint">
                  يمكنك اختيار عدة صور من الهاتف أو الجهاز
                </small>

                {weeklyImages.length > 0 && (
                  <small className="field-hint">
                    تم اختيار {weeklyImages.length} صورة
                  </small>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="preview-button"
                onClick={handleWeeklyPreview}
              >
                معاينة التقرير
              </button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  /* =====================================================
     نموذج التقرير الشهري
  ===================================================== */

  if (view === 'monthly') {
    return (
      <main
        className="app-shell"
        dir="rtl"
      >
        <section className="home-card report-page">
          <button
            type="button"
            className="back-button"
            onClick={() =>
              changeView('home')
            }
          >
            ← رجوع
          </button>

          <div className="logos-row">
            <img
              src="/afaaq-logo.png"
              alt="شعار آفاق"
              className="brand-logo afaaq-logo"
            />

            <img
              src="/bunyan-logo.png"
              alt="شعار بنيان"
              className="brand-logo bunyan-logo"
            />
          </div>

          <div className="intro">
            <h1>
              التقرير الشهري
            </h1>

            <p>
              أدخل ملخص الإنجاز خلال الشهر
            </p>
          </div>

          <form
            className="report-form"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="monthlyPreacherName">
                  اسم الداعية
                </label>

                <input
                  id="monthlyPreacherName"
                  name="preacherName"
                  type="text"
                  value={monthlyForm.preacherName}
                  onChange={handleMonthlyChange}
                  placeholder="اكتب اسم الداعية"
                />
              </div>

              <div className="form-field">
                <label htmlFor="monthlyCountry">
                  الدولة
                </label>

                <select
                  id="monthlyCountry"
                  name="country"
                  value={monthlyForm.country}
                  onChange={handleMonthlyChange}
                >
                  <option value="">
                    اختر الدولة
                  </option>

                  {countries.map(
                    (country) => (
                      <option
                        key={country}
                        value={country}
                      >
                        {country}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="monthlyMonth">
                  الشهر والسنة
                </label>

                <input
                  id="monthlyMonth"
                  name="month"
                  type="month"
                  value={monthlyForm.month}
                  onChange={handleMonthlyChange}
                />
              </div>
            </div>

            <div className="weekly-section">
              <h2 className="weekly-section-title">
                ملخص البرامج والأنشطة
              </h2>

              <div className="weekly-activity-card">
                <div className="weekly-activity-header">
                  <strong>
                    التعريف بالإسلام
                  </strong>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="islamActivities">
                      عدد الأنشطة
                    </label>

                    <input
                      id="islamActivities"
                      name="islamActivities"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.islamActivities
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="islamBeneficiaries">
                      عدد المستفيدين
                    </label>

                    <input
                      id="islamBeneficiaries"
                      name="islamBeneficiaries"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.islamBeneficiaries
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>

                  <div className="form-field form-field-wide">
                    <label htmlFor="islamNewMuslims">
                      عدد الداخلين في الإسلام
                    </label>

                    <input
                      id="islamNewMuslims"
                      name="islamNewMuslims"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.islamNewMuslims
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>
                </div>
              </div>

              <div className="weekly-activity-card">
                <div className="weekly-activity-header">
                  <strong>
                    تثبيت المسلم الجديد
                  </strong>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="newMuslimActivities">
                      عدد الأنشطة
                    </label>

                    <input
                      id="newMuslimActivities"
                      name="newMuslimActivities"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.newMuslimActivities
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="newMuslimBeneficiaries">
                      عدد المستفيدين
                    </label>

                    <input
                      id="newMuslimBeneficiaries"
                      name="newMuslimBeneficiaries"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.newMuslimBeneficiaries
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>
                </div>
              </div>

              <div className="weekly-activity-card">
                <div className="weekly-activity-header">
                  <strong>
                    تعليم المسلمين
                  </strong>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="teachingActivities">
                      عدد الأنشطة
                    </label>

                    <input
                      id="teachingActivities"
                      name="teachingActivities"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.teachingActivities
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="teachingBeneficiaries">
                      عدد المستفيدين
                    </label>

                    <input
                      id="teachingBeneficiaries"
                      name="teachingBeneficiaries"
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={
                        monthlyForm.teachingBeneficiaries
                      }
                      onChange={handleMonthlyChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="weekly-totals">
              <div className="weekly-total-card">
                <strong>
                  {monthlyTotals.activities}
                </strong>

                <span>
                  إجمالي الأنشطة
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {monthlyTotals.beneficiaries}
                </strong>

                <span>
                  إجمالي المستفيدين
                </span>
              </div>

              <div className="weekly-total-card">
                <strong>
                  {monthlyTotals.newMuslims}
                </strong>

                <span>
                  إجمالي الداخلين في الإسلام
                </span>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field form-field-wide">
                <label htmlFor="monthlyHighlights">
                  أبرز الأنشطة خلال الشهر
                </label>

                <textarea
                  id="monthlyHighlights"
                  name="highlights"
                  rows="4"
                  value={monthlyForm.highlights}
                  onChange={handleMonthlyChange}
                  placeholder="اكتب أهم الأنشطة التي نُفذت خلال الشهر باختصار"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="monthlyResults">
                  أبرز النتائج والإنجازات
                </label>

                <textarea
                  id="monthlyResults"
                  name="results"
                  rows="4"
                  value={monthlyForm.results}
                  onChange={handleMonthlyChange}
                  placeholder="اكتب أبرز النتائج والإنجازات التي تحققت خلال الشهر"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="monthlyChallenges">
                  التحديات أو الصعوبات

                  <span className="optional-text">
                    {' '}— اختياري
                  </span>
                </label>

                <textarea
                  id="monthlyChallenges"
                  name="challenges"
                  rows="3"
                  value={monthlyForm.challenges}
                  onChange={handleMonthlyChange}
                  placeholder="اكتب التحديات أو الصعوبات إن وجدت"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="monthlyNotes">
                  ملاحظات

                  <span className="optional-text">
                    {' '}— اختياري
                  </span>
                </label>

                <textarea
                  id="monthlyNotes"
                  name="notes"
                  rows="3"
                  value={monthlyForm.notes}
                  onChange={handleMonthlyChange}
                  placeholder="أي ملاحظات إضافية"
                />
              </div>

              <div className="form-field form-field-wide">
                <label htmlFor="monthlyEvidence">
                  الصور والشواهد
                </label>

                <input
                  id="monthlyEvidence"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMonthlyImages}
                />

                <small className="field-hint">
                  اختر مجموعة مختارة من صور الشهر
                </small>

                {monthlyImages.length > 0 && (
                  <small className="field-hint">
                    تم اختيار {monthlyImages.length} صورة
                  </small>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="preview-button"
                onClick={handleMonthlyPreview}
              >
                معاينة التقرير
              </button>
            </div>
          </form>
        </section>
      </main>
    )
  }

  /* =====================================================
     الصفحة الرئيسية
  ===================================================== */

  return (
    <main
      className="app-shell"
      dir="rtl"
    >
      <section className="home-card">
        <div className="logos-row">
          <img
            src="/afaaq-logo.png"
            alt="شعار آفاق"
            className="brand-logo afaaq-logo"
          />

          <img
            src="/bunyan-logo.png"
            alt="شعار بنيان"
            className="brand-logo bunyan-logo"
          />
        </div>

        <div className="intro">
          <h1>
            تقارير مشروع آفاق
          </h1>

          <p>
            اختر نوع التقرير الذي ترغب في إعداده
          </p>
        </div>

        <div className="report-options">
          <button
            type="button"
            className="report-card"
            onClick={() =>
              changeView('activity')
            }
          >
            <span className="report-icon">
              📌
            </span>

            <strong>
              تقرير نشاط دعوي
            </strong>

            <small>
              لتوثيق الأنشطة الدعوية خلال اليوم
            </small>
          </button>

          <button
            type="button"
            className="report-card"
            onClick={() =>
              changeView('weekly')
            }
          >
            <span className="report-icon">
              📅
            </span>

            <strong>
              تقرير أسبوعي
            </strong>

            <small>
              ملخص أنشطة الداعية خلال الأسبوع
            </small>
          </button>

          <button
            type="button"
            className="report-card"
            onClick={() =>
              changeView('monthly')
            }
          >
            <span className="report-icon">
              📊
            </span>

            <strong>
              تقرير شهري
            </strong>

            <small>
              ملخص الإنجاز خلال الشهر
            </small>
          </button>
        </div>
      </section>
    </main>
  )
}

export default App