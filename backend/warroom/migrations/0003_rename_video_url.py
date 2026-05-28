from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('warroom', '0002_contestfaq_contestflowstep_contestoverview_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='video',
            old_name='gdrive_url',
            new_name='video_url',
        ),
        migrations.AlterField(
            model_name='video',
            name='video_url',
            field=models.URLField(help_text='paste any video link — youtube, vimeo, google drive, or a direct .mp4'),
        ),
    ]
