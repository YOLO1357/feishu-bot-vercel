const { createHmac } = require('crypto');

// 验证飞书请求的 Token
function verifyFeishuRequest(timestamp, signature, secret) {
  const hmac = createHmac('sha256', secret);
  const sign = hmac.update(`${timestamp}\n${secret}`).digest('base64');
  return sign === signature;
}

export default async function handler(req, res) {
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { header, event } = req.body;

    // URL 验证处理
    if (req.body.challenge) {
      console.log('收到 URL 验证请求');
      return res.status(200).json({ challenge: req.body.challenge });
    }

    // 检查必要字段
    if (!header || !header.event_type) {
      return res.status(200).json({ code: 0, msg: 'ok' });
    }

    console.log(`收到事件: ${header.event_type}`);

    // 处理卡片交互事件
    if (header.event_type === 'im:card:interactive' || 
        header.event_type === 'card.action') {
      await handleCardInteraction(req, res);
      return;
    }

    // 处理其他事件
    res.status(200).json({ code: 0, msg: 'ok' });

  } catch (error) {
    console.error('处理请求出错:', error);
    res.status(500).json({ code: 500, msg: 'server error' });
  }
}

async function handleCardInteraction(req, res) {
  const { header, event } = req.body;
  const { action, user, message } = event;
  
  console.log('卡片交互:', {
    actionValue: action?.value || 'unknown',
    userId: user?.open_id
  });

  // 获取操作值和用户ID
  const actionValue = action?.value || action?.tag || 'unknown';
  const userId = user?.open_id || user?.user_id;

  // 创建回复内容
  const replyContent = createReply(actionValue, userId);

  // 飞书卡片交互响应格式
  const response = {
    code: 0,
    msg: 'success',
    data: {
      response_type: 'reply',
      reply: replyContent
    }
  };

  console.log('发送回复:', response);
  res.status(200).json(response);
}

function createReply(actionValue, userId) {
  switch (actionValue) {
    case '订单询价':
    case 'order_inquiry':
      return {
        type: 'interactive',
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              type: 'plain_text',
              content: '📦 订单询价\n\n请提供您的订单信息：'
            }
          },
          {
            tag: 'input',
            name: 'order_id',
            placeholder: {
              type: 'plain_text',
              content: '请输入订单号'
            },
            required: true
          },
          {
            tag: 'input',
            name: 'weight',
            placeholder: {
              type: 'plain_text',
              content: '包裹重量(kg)'
            }
          },
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '🚀 提交询价'
            },
            type: 'primary',
            value: 'submit_inquiry'
          }
        ]
      };

    case '海外仓地址':
    case 'warehouse_address':
      return {
        type: 'interactive',
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              type: 'plain_text',
              content: '🏭 海外仓地址\n\n\n美国仓：\n1234 Warehouse Blvd, Los Angeles\n\n纽约仓：\n5678 Storage Ave, New York'
            }
          }
        ]
      };

    case '物流问题':
    case 'logistics_issue':
      return {
        type: 'interactive',
        config: {
          wide_screen_mode: true
        },
        elements: [
          {
            tag: 'div',
            text: {
              type: 'plain_text',
              content: '🚚 物流问题\n\n请描述您遇到的问题：'
            }
          },
          {
            tag: 'textarea',
            name: 'issue_description',
            placeholder: {
              type: 'plain_text',
              content: '详细描述问题...'
            },
            required: true
          },
          {
            tag: 'button',
            text: {
              type: 'plain_text',
              content: '📤 提交问题'
            },
            type: 'primary',
            value: 'submit_issue'
          }
        ]
      };

    default:
      return {
        type: 'text',
        content: `🤖 收到您的操作：${actionValue}\n\n感谢使用！`
      };
  }
}