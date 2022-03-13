import commonStyles from "../Common.module.scss";

export const Question4 = () => {
    return <div className={commonStyles.question_card}>
    <div className={commonStyles.question_card_title}>
        4. 这幅作品的受众包括哪些年龄段？（多选）
    </div>
    <div className={commonStyles.question_card_content}>
        <ul className={commonStyles.tags}>
            <li className={commonStyles.tag}>青少年(~17)</li>    
            <li className={commonStyles.tag}>青年(18~28)</li>    
            <li className={commonStyles.tag}>壮年(29~44)</li>    
            <li className={commonStyles.tag}>壮年(45~64)</li>    
            <li className={commonStyles.tag}>壮年(65~)</li>    
        </ul>
    </div>
</div>
}