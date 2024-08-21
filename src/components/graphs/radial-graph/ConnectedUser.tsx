import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface RadialSemicircleProps {
  value: number;
  darkMode?: boolean;
}

const RadialSemicircle: React.FC<RadialSemicircleProps> = ({ value,darkMode }) => {
  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 350,
      width: '100%',
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '70%',
        },
        track: {
          background: "#e7e7e7",
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            offsetY: 8,
            fontSize: '40px',
            fontWeight: 600,
            color: darkMode ? 'white' : 'black',
            formatter: function(val) {
              return val + '%';
            }
          }
        }
      }
    },
    fill: {
      type: 'solid',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#1ab7ea'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    series: [value],
    labels: ['Connected Users'],
  };

  return (
    <div className='flex h-full w-full flex-col justify-center items-center'>
      <ReactApexChart 
        options={options}
        series={options.series}
        type="radialBar"
        height={350}
      />
    </div>
  );
};

export default RadialSemicircle;