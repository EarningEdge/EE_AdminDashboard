import React from 'react'
import ReactApexChart from 'react-apexcharts'
import moment from 'moment'

interface AreaChartProps {
  data: { name: string; data: number[] }[]
  categories: string[]
  title: string
  colors: string[]
  darkMode?: boolean
}

const AreaChart: React.FC<AreaChartProps> = ({
  data,
  categories,
  colors,
  darkMode
}) => {
  const options = {
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: categories.map(date => moment(date).format('D MMM')),
      labels: {
        style: {
          colors: darkMode ? '#fff' : '#000',
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: darkMode ? '#fff' : '#000',
        }
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      x: {
        format: 'dd MMM'
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    colors: colors,
    legend: {
      labels: {
        colors: darkMode ? '#ffffff' : '#000000'
      }
    }
  }

  return (
    <div className='flex-1 dark:bg-dark-blue'>
      <ReactApexChart
        //@ts-ignore
        options={options}
        series={data}
        type='area'
        height="100%"
      />
    </div>
  )
}

export default AreaChart