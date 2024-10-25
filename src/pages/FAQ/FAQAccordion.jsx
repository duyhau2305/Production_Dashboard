import React, { useState } from "react";

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  const faqData = [
    {
      question: "Quản lý giám sát hiệu suất là gì?",
      answer:
        "Giám sát hiệu suất là quá trình theo dõi, phân tích và tối ưu hóa hiệu suất của hệ thống, thiết bị hoặc ứng dụng để đảm bảo hoạt động hiệu quả, ngăn chặn sự cố và tối đa hóa hiệu suất làm việc.",
    },
    {
      question: "Tại sao cần giám sát hiệu suất?",
      answer:
        "Giám sát hiệu suất giúp phát hiện sớm các vấn đề, cải thiện hiệu suất, đảm bảo độ tin cậy, và tối ưu hóa tài nguyên hệ thống.",
    },
    {
      question: "Những yếu tố nào cần được giám sát trong quản lý hiệu suất?",
      answer:
        "Các yếu tố bao gồm CPU, RAM, ổ cứng, hiệu suất mạng, hiệu suất ứng dụng và hiệu suất máy chủ.",
    },
    {
      question: "Những công cụ nào hỗ trợ giám sát hiệu suất?",
      answer:
        "Có nhiều công cụ giám sát như Datadog, New Relic, Grafana & Prometheus, và Nagios.",
    },
    {
      question: "Làm thế nào để cải thiện hiệu suất hệ thống?",
      answer:
        "Bạn có thể tối ưu hóa tài nguyên, kiểm tra và tối ưu mã nguồn, cải thiện cấu trúc mạng, và sử dụng các kỹ thuật load balancing hoặc clustering.",
    },
    {
      question: "Hiệu suất hệ thống có thể bị ảnh hưởng bởi những yếu tố nào?",
      answer:
        "Các yếu tố bao gồm tài nguyên phần cứng thiếu hụt, lưu lượng mạng quá tải, mã nguồn kém hiệu quả và vấn đề về cơ sở dữ liệu.",
    },
    {
      question: "Làm thế nào để thiết lập cảnh báo khi có vấn đề về hiệu suất?",
      answer:
        "Sử dụng các công cụ giám sát để thiết lập ngưỡng cho các chỉ số hiệu suất và nhận cảnh báo qua email, SMS, hoặc bảng điều khiển khi vượt qua ngưỡng.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-md">
      <h2 className="text-3xl font-bold mb-6 text-center">FAQ - Quản Lý Giám Sát Hiệu Suất</h2>
      {faqData.map((item, index) => (
        <div key={index} className="mb-4 border-b">
          <button
            className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onClick={() => toggleAccordion(index)}
          >
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium">{item.question}</span>
              <span>{openIndex === index ? "-" : "+"}</span>
            </div>
          </button>
          {openIndex === index && (
            <div className="p-4 bg-gray-50 text-gray-700">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQAccordion;
