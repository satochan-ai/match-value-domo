/**
 * sampleData.js
 * サンプルスキルシートデータ
 */

const SAMPLE_DATA = {
  high: {
    // 想定結果（高評価）:
    // スコア: 80点前後（即提案）
    // 技術力満点、上流経験、クラウド/AI等の希少スキルあり。単価レンジも高くなる。
    age: 32,
    desiredRate: 80,
    availableFrom: '即日〜',
    remoteOnly: false,
    skillSheet: `【スキルシート】

■ 基本情報
IT経験：8年
年齢：32歳

■ スキルサマリ
Java・Spring Bootを主軸としたバックエンドエンジニア。
直近ではAWSを活用したクラウドネイティブなシステム開発を担当。
要件定義から製造・テストまでの工程経験を持ち、チームリードも経験あり。

■ 保有スキル
・言語：Java, Python, TypeScript
・フレームワーク：Spring Boot, React
・クラウド：AWS（EC2, S3, RDS, Lambda）
・その他：Docker, Terraform, OpenAI(ChatGPT API)

■ 職務経歴
【2022年04月〜現在】自社ECサイトリプレイス
規模：10名
担当工程：要件定義・基本設計・詳細設計・製造・テスト
役割：チームリーダー（顧客折衝・コードレビュー）
・オンプレからAWSへの移行
・React/Spring BootによるSPA化
・ChatGPTを用いた商品レコメンド機能開発

【2019年06月〜2022年03月】金融系基幹システム開発
規模：20名
担当工程：詳細設計・製造・テスト
・JavaによるAPI開発
`
  },
  standard: {
    // 想定結果（標準）:
    // スコア: 65点前後（条件付き提案）
    // IT経験3〜5年程度、実装〜詳細設計メイン。標準的なWebエンジニア。
    age: 28,
    desiredRate: 60,
    availableFrom: '来月〜',
    remoteOnly: false,
    skillSheet: `【スキルシート】

■ 基本情報
IT経験：4年
年齢：28歳

■ スキルサマリ
PHP、Laravelを用いたWebアプリケーション開発エンジニア。
BtoCサービスの追加機能開発や保守運用をメインに担当。
詳細設計からテストまでの一連の経験があります。

■ 保有スキル
・言語：PHP, JavaScript, HTML, CSS
・フレームワーク：Laravel, jQuery
・DB：MySQL
・ツール：Git, Backlog

■ 職務経歴
【2021年04月〜現在】人材系マッチングシステム開発
担当工程：詳細設計・製造・テスト
使用技術：PHP, Laravel, MySQL
・新規機能の設計、実装
・バッチ処理のパフォーマンス改善
・単体テスト、結合テストの実施

【2020年04月〜2021年03月】コーポレートサイト制作
担当工程：製造・テスト
・WordPressを用いたサイト構築
・HTML/CSS/JavaScriptによるフロント実装
`
  },
  low: {
    // 想定結果（低評価）:
    // スコア: 50点未満（見送り）
    // 経験年数が浅い、またはテストのみ。フルリモート限定等の厳しい条件。
    age: 25,
    desiredRate: 55,
    availableFrom: '未定',
    remoteOnly: true,
    skillSheet: `職務経歴書

経験年数：1年
希望：フルリモートのみ

・2023年〜現在
システムテスト業務
手順書に沿ったテスト実行
バグ報告
エクセルでのデータ入力

使用ツール：Excel, Word

自己PR
プログラミングスクールでJavaを半年勉強しました。
これから開発業務に携わっていきたいと考えています。
`
  }
};
