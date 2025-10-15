import json
import os
import base64
from typing import Dict, Any
from openai import OpenAI

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Анализирует торговые графики с помощью OpenAI Vision API
    Args: event - dict с httpMethod, body (base64 изображение)
          context - объект с атрибутами request_id, function_name
    Returns: HTTP response с торговым сигналом и анализом
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        image_data = body_data.get('image')
        
        if not image_data:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Image data is required'}),
                'isBase64Encoded': False
            }
        
        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'OpenAI API key not configured'}),
                'isBase64Encoded': False
            }
        
        client = OpenAI(api_key=api_key)
        
        prompt = """Ты профессиональный трейдер и технический аналитик. 
Проанализируй этот торговый график и дай точный торговый сигнал.

Верни ответ СТРОГО в формате JSON:
{
  "signal": "BUY" или "SELL",
  "confidence": число от 0 до 100,
  "indicators": {
    "trend": "описание тренда",
    "momentum": "описание импульса",
    "volume": "описание объема"
  },
  "analysis": "краткий анализ 2-3 предложения"
}

Анализируй:
- Тренды и паттерны
- Уровни поддержки/сопротивления
- Технические индикаторы (если видны)
- Объемы торгов
- Свечные паттерны

Будь точным и конкретным."""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_data
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.3
        )
        
        ai_response = response.choices[0].message.content
        
        result = json.loads(ai_response)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(result),
            'isBase64Encoded': False
        }
        
    except json.JSONDecodeError as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'AI response parsing error',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Analysis failed',
                'details': str(e)
            }),
            'isBase64Encoded': False
        }
